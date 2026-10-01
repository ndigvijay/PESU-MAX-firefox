import { load } from "../utils/storage.js";
import { SESSION_KEEPER_KEY } from "../utils/storageKeys.js";

export const ACADEMY_BASE_URL = "https://www.pesuacademy.com/Academy";
export const ACADEMY_PROFILE_PATH = "/s/studentProfilePESU";
const ACADEMY_LOGIN_PATH = "/j_spring_security_check";
const CSRF_META_PATTERN = /<meta\s+name="csrf-token"\s+content="([^"]+)"/i;

export const SESSION_CHECK_REDIRECT = "manual";
export const isSessionRedirect = (response) => response.type === "opaqueredirect";

export async function probeSession() {
  const controller = new AbortController();

  try {
    const response = await fetch(`${ACADEMY_BASE_URL}${ACADEMY_PROFILE_PATH}`, {
      credentials: "include",
      redirect: SESSION_CHECK_REDIRECT,
      signal: controller.signal
    });

    const alive = !isSessionRedirect(response);
    controller.abort();
    return alive;
  } catch (error) {
    return null;
  }
}

export async function readSessionToken() {
  try {
    const response = await fetch(`${ACADEMY_BASE_URL}${ACADEMY_PROFILE_PATH}`, {
      credentials: "include",
      redirect: SESSION_CHECK_REDIRECT
    });

    if (isSessionRedirect(response)) {
      return { alive: false, csrfToken: null };
    }

    const match = (await response.text()).match(CSRF_META_PATTERN);
    return { alive: true, csrfToken: match ? match[1] : null };
  } catch (error) {
    return null;
  }
}

async function readLoginToken(signal) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(`${ACADEMY_BASE_URL}/`, { credentials: "include", signal });
    const html = await response.text();
    const match =
      html.match(/name="_csrf"[^>]*value="([^"]+)"/i) ||
      html.match(/value="([^"]+)"[^>]*name="_csrf"/i);

    if (match) return match[1];
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

export async function loginToAcademy({ username, password }, signal) {
  const token = await readLoginToken(signal);
  if (signal.aborted || (await load(SESSION_KEEPER_KEY)) !== true) return null;

  if (!token) {
    throw new Error("Unable to read academy login token");
  }

  const response = await fetch(`${ACADEMY_BASE_URL}${ACADEMY_LOGIN_PATH}`, {
    method: "POST",
    credentials: "include",
    redirect: "follow",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      _csrf: token,
      j_username: username,
      j_password: password
    }).toString(),
    signal
  });

  const loggedIn = response.url.includes(ACADEMY_PROFILE_PATH);
  return loggedIn;
}
