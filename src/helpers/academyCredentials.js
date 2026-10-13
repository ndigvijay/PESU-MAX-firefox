import { load, remove, save } from "../utils/storage.js";
import { ACADEMY_CREDENTIAL_KEY, SESSION_KEEPER_KEY } from "../utils/storageKeys.js";

export async function readStoredCredentials() {
  const stored = await load(ACADEMY_CREDENTIAL_KEY);
  if (!stored || !stored.username || !stored.password) {
    return null;
  }

  try {
    return { username: atob(stored.username), password: atob(stored.password) };
  } catch (error) {
    return null;
  }
}

const isSessionKeeperOn = async () => (await load(SESSION_KEEPER_KEY)) === true;

// Returns whether the credentials were kept; nothing is stored unless "Keep me signed in" is on.
export async function rememberCredentials({ username, password }) {
  if (!username || !password || !(await isSessionKeeperOn())) return false;

  await save(ACADEMY_CREDENTIAL_KEY, {
    username: btoa(username),
    password: btoa(password),
    updatedAt: Date.now()
  });

  if (await isSessionKeeperOn()) return true;
  await forgetStoredCredentials();
  return false;
}

export async function forgetStoredCredentials() {
  await remove(ACADEMY_CREDENTIAL_KEY);
}
