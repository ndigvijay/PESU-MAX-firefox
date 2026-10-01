import { probeSession, loginToAcademy, readSessionToken } from "../helpers/academyAuth.js";
import { readStoredCredentials } from "../helpers/academyCredentials.js";
import { clearSessionExpired, resetCsrfToken } from "../helpers/pesuAPI.js";
import { load, save } from "../utils/storage.js";
import { SESSION_KEEPER_KEY, SESSION_RENEWED_KEY } from "../utils/storageKeys.js";

const MANUAL_LOGIN_QUIET_MS = 60 * 1000;

let loginController = null;
let manualLoginAt = 0;

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[SESSION_KEEPER_KEY] &&
      changes[SESSION_KEEPER_KEY].newValue !== true) {
    loginController?.abort();
  }
});

export async function handleAcademySession(action) {
  if (action === "manualAcademyLogin") {
    manualLoginAt = Date.now();
    loginController?.abort();
    return true;
  }
  if ((await load(SESSION_KEEPER_KEY)) !== true) return null;
  if (action === "probeAcademySession") return probeSession();
  if (action === "readAcademySessionToken") {
    const session = await readSessionToken();
    if (session?.alive) clearSessionExpired();
    return session;
  }
  if (loginController || Date.now() - manualLoginAt < MANUAL_LOGIN_QUIET_MS) return null;

  const controller = new AbortController();
  loginController = controller;
  try {
    const credentials = await readStoredCredentials();
    if (!credentials || controller.signal.aborted) return null;
    const loggedIn = await loginToAcademy(credentials, controller.signal);
    if (loggedIn) {
      await resetCsrfToken();
      clearSessionExpired();
      await save(SESSION_RENEWED_KEY, Date.now());
    }
    return controller.signal.aborted ? null : loggedIn;
  } catch (error) {
    if (controller.signal.aborted) return null;
    throw error;
  } finally {
    loginController = null;
  }
}
