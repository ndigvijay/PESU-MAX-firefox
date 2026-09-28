import { useEffect, useState } from "react";
import { load, save } from "../../../src/utils/storage.js";

export default function useStoredSetting(storageKey, fallback, title) {
  const [value, setValue] = useState(fallback);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let stale = false;
    let changed = false;
    setReady(false);
    setError("");
    const onChanged = (changes, area) => {
      if (area !== "local" || !changes[storageKey]) return;
      changed = true;
      setValue(changes[storageKey].newValue ?? fallback);
      setReady(true);
    };
    chrome.storage.onChanged.addListener(onChanged);
    load(storageKey)
      .then((stored) => {
        if (stale) return;
        if (!changed) setValue(stored ?? fallback);
        setReady(true);
      })
      .catch(() => {
        if (!stale && !changed) setError(`Could not load ${title}. Please retry.`);
      });
    return () => {
      stale = true;
      chrome.storage.onChanged.removeListener(onChanged);
    };
  }, [storageKey, fallback, title, reload]);

  const update = async (next) => {
    setSaving(true);
    setError("");
    try {
      await save(storageKey, next);
      return true;
    } catch (error) {
      setError(`Could not save ${title}. Please try again.`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { value, ready, saving, error, update, retry: () => setReload((count) => count + 1) };
}
