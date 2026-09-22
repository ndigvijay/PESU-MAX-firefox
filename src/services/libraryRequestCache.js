import { load, save } from "../utils/storage.js";

const TTL = 15 * 60 * 1000;
const STORAGE_KEY = "librarySearchCacheV1";
const pending = new Map();
let searchQueue = Promise.resolve();

export function singleFlight(key, operation) {
  if (!pending.has(key)) {
    const promise = Promise.resolve().then(operation).finally(() => pending.delete(key));
    pending.set(key, promise);
  }
  return pending.get(key);
}

// Serialize WebForms operations so searches cannot race while updating session state.
export function cachedLibrarySearch(key, operation) {
  return singleFlight(JSON.stringify(["search", key]), () => {
    const task = searchQueue.then(async () => {
      const stored = (await load(STORAGE_KEY)) || {};
      const cache = Object.fromEntries(Object.entries(stored).filter(
        ([, entry]) => entry && Date.now() - entry.savedAt < TTL
      ));
      if (cache[key]) return cache[key].value;
      const value = await operation();
      cache[key] = { savedAt: Date.now(), value };
      const entries = Object.entries(cache).sort((a, b) => b[1].savedAt - a[1].savedAt);
      const bounded = {};
      let size = 0;
      for (const [entryKey, entry] of entries.slice(0, 10)) {
        size += JSON.stringify(entry).length * 2;
        if (size > 2 * 1024 * 1024) break;
        bounded[entryKey] = entry;
      }
      // A cache quota failure must not discard a successful library response.
      await save(STORAGE_KEY, bounded).catch(() => {});
      return value;
    });
    searchQueue = task.catch(() => {});
    return task;
  });
}

let activeFiles = 0;
const fileWaiters = [];
export async function withFileSlot(operation) {
  if (activeFiles >= 3) await new Promise((resolve) => fileWaiters.push(resolve));
  else activeFiles += 1;
  try {
    return await operation();
  } finally {
    const next = fileWaiters.shift();
    if (next) next();
    else activeFiles -= 1;
  }
}
