import { load } from "../utils/storage.js";
import {
  RELOGIN_GUARD_KEY,
  REJECT_COUNT_KEY,
  SESSION_KEEPER_KEY
} from "../utils/storageKeys.js";
import {
  ACADEMY_BASE_URL,
  ACADEMY_PROFILE_PATH
} from "../helpers/academyAuth.js";
import {
  captureCredentials,
  forgetStoredCredentials
} from "../helpers/academyCredentials.js";
import { loginToAcademy, probeSession } from "../services/academySession.js";
import {
  ACADEMY_APP_PATH_PREFIX,
  LOG_PREFIX,
  hasCaptchaGate,
  hasLoginForm,
  loginFormEngaged
} from "./academyPage.js";

// Check interval: 4 mins
const SESSION_PING_INTERVAL_MS = 4 * 60 * 1000;
const RELOGIN_MIN_GAP_MS = SESSION_PING_INTERVAL_MS;
const RELOGIN_BACKOFF_MS = 15 * 60 * 1000;
const MAX_RELOGIN_REJECTIONS = 3;
const LOGIN_PAGE_GRACE_MS = 1000;

// Returns "ok", "failed" or "skipped".
async function attemptReLogin(isCurrent) {
  if (!isCurrent()) return "skipped";
  const blockedUntil = Number(sessionStorage.getItem(RELOGIN_GUARD_KEY) || 0);
  if (Date.now() < blockedUntil) return "skipped";
  sessionStorage.setItem(RELOGIN_GUARD_KEY, String(Date.now() + RELOGIN_MIN_GAP_MS));

  let loggedIn = false;
  try {
    loggedIn = await loginToAcademy();
  } catch (error) {
    console.warn(`${LOG_PREFIX} academy re-login failed:`, error.message);
    return "failed";
  }

  if (!isCurrent() || loggedIn === null) return "skipped";

  if (loggedIn) {
    sessionStorage.removeItem(REJECT_COUNT_KEY);
    await captureCredentials(isCurrent);
    return "ok";
  }

  const rejections = Number(sessionStorage.getItem(REJECT_COUNT_KEY) || 0) + 1;
  sessionStorage.setItem(REJECT_COUNT_KEY, String(rejections));
  sessionStorage.setItem(RELOGIN_GUARD_KEY, String(Date.now() + RELOGIN_BACKOFF_MS));

  if (rejections >= MAX_RELOGIN_REJECTIONS) {
    await forgetStoredCredentials();
    console.warn(
      `${LOG_PREFIX} stored academy credentials were rejected repeatedly; cleared`
    );
  } else {
    console.warn(
      `${LOG_PREFIX} academy re-login rejected (${rejections}/${MAX_RELOGIN_REJECTIONS}); ` +
      "credentials kept"
    );
  }
  return "failed";
}

async function settleAppPage(isCurrent) {
  const alive = await probeSession();
  if (!isCurrent() || alive === null) return;
  if (alive) {
    // User Logged in
    await captureCredentials(isCurrent);
    return;
  }

  await attemptReLogin(isCurrent);
}

async function settleLoginPage(isCurrent) {
  if (loginFormEngaged()) return;

  // captcha error
  if (hasCaptchaGate()) {
    console.warn(
      `${LOG_PREFIX} academy login is captcha-gated right now; waiting for a manual login. This is a temp fix used by PESUAcademy to stop DDOS attacks`
    );
    sessionStorage.setItem(RELOGIN_GUARD_KEY, String(Date.now() + RELOGIN_BACKOFF_MS));
    return;
  }

  const result = await attemptReLogin(isCurrent);

  if (!isCurrent()) return;

  if (result === "ok") {
    location.replace(`${ACADEMY_BASE_URL}${ACADEMY_PROFILE_PATH}`);
    return;
  }

  if (result === "failed") location.reload();
}

let generation = 0;

async function settleSession() {
  const currentGeneration = generation;
  const isCurrent = () => generation === currentGeneration;
  // Default: OFF
  if ((await load(SESSION_KEEPER_KEY)) !== true) return;

  if (hasLoginForm()) {
    await settleLoginPage(isCurrent);
    return;
  }

  await settleAppPage(isCurrent);
}

export function startSessionKeeper() {
  if (hasLoginForm()) {
    setTimeout(() => void settleSession().catch(() => {}), LOGIN_PAGE_GRACE_MS);
  } else if (location.pathname.startsWith(ACADEMY_APP_PATH_PREFIX)) {
    void settleSession().catch(() => {});
  }

  setInterval(() => void settleSession().catch(() => {}), SESSION_PING_INTERVAL_MS);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[SESSION_KEEPER_KEY]) {
      generation += 1;
      void settleSession().catch(() => {});
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void settleSession().catch(() => {});
  });
}
