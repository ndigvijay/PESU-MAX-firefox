import { CSRF_INPUT_SELECTOR, CSRF_META_SELECTOR } from "../academyPage.js";

let mainWorldInjected = false;

function injectMainWorld() {
  if (mainWorldInjected) return;
  mainWorldInjected = true;
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("content/csrfSyncMain.js");
  script.onload = script.onerror = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

export function syncPageCsrfToken(token) {
  const meta = document.querySelector(CSRF_META_SELECTOR);
  if (!token || !meta || meta.getAttribute("content") === token) return;

  meta.setAttribute("content", token);
  document.querySelectorAll(CSRF_INPUT_SELECTOR).forEach((input) => {
    input.value = token;
  });
  injectMainWorld();
}
