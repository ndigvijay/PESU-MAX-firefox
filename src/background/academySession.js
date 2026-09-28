import { probeSession, loginToAcademy } from "../helpers/academyAuth.js";
import { readStoredCredentials } from "../helpers/academyCredentials.js";
import { resetCsrfToken } from "../helpers/pesuAPI.js";
import { load } from "../utils/storage.js";
import { SESSION_KEEPER_KEY } from "../utils/storageKeys.js";

let loginController = null;

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[SESSION_KEEPER_KEY] &&
      changes[SESSION_KEEPER_KEY].newValue !== true) {
    loginController?.abort();
  }
});

export async function handleAcademySession(action) {
  if ((await load(SESSION_KEEPER_KEY)) !== true) return null;
  if (action === "probeAcademySession") return probeSession();
  if (loginController) return null;

  const controller = new AbortController();
  loginController = controller;
  try {
    const credentials = await readStoredCredentials();
    if (!credentials || controller.signal.aborted) return null;
    const loggedIn = await loginToAcademy(credentials, controller.signal);
    if (loggedIn) await resetCsrfToken();
    return controller.signal.aborted ? null : loggedIn;
  } catch (error) {
    if (controller.signal.aborted) return null;
    throw error;
  } finally {
    loginController = null;
  }
}
