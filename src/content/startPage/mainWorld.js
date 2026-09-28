import { MENU_ITEM_ID_PREFIX, MENU_LIST_ID, isHome, menuItemFor } from "../academyPage.js";
import { isKnownPage, START_PAGE_ATTR, START_PAGE_HOME } from "./startPage.js";

const STARTUP_TIMEOUT_MS = 5000;
let finished = false;
let pendingHome = null;
let jquery = null;
let originalTrigger = null;

function finish() {
  finished = true;
  observer.disconnect();
  clearTimeout(timeout);
  document.removeEventListener("click", onUserNavigation, true);
  window.removeEventListener("load", settleStartPage);
}

function onUserNavigation(event) {
  if (event.isTrusted && event.target.closest?.(`#${MENU_LIST_ID} li`)) {
    pendingHome = null;
    finish();
  }
}

function settleStartPage() {
  if (finished || !jquery) return;
  const page = document.documentElement.getAttribute(START_PAGE_ATTR);
  if (!isKnownPage(page)) return;

  // The injected bridge may load after Academy's first Home click.
  if (!pendingHome && document.readyState !== "complete") return;
  const wanted = page === START_PAGE_HOME ? null : menuItemFor(page);
  if (page !== START_PAGE_HOME && !wanted) return;

  const fallback = pendingHome;
  pendingHome = null;
  finish();
  if (wanted) originalTrigger.call(jquery(wanted), "click");
  else if (fallback) originalTrigger.apply(fallback.target, fallback.args);
}

function hookTrigger(value) {
  if (!value?.fn || typeof value.fn.trigger !== "function" || jquery) return;
  jquery = value;
  originalTrigger = value.fn.trigger;
  value.fn.trigger = function (type) {
    const target = this[0];
    if (!finished && type === "click" && target instanceof Element &&
        target.id.startsWith(MENU_ITEM_ID_PREFIX) && isHome(target)) {
      pendingHome = { target: this, args: arguments };
      settleStartPage();
      return this;
    }
    return originalTrigger.apply(this, arguments);
  };
  settleStartPage();
}

const observer = new MutationObserver(settleStartPage);
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: [START_PAGE_ATTR],
  childList: true,
  subtree: true
});
const timeout = setTimeout(() => {
  const fallback = pendingHome;
  pendingHome = null;
  finish();
  if (fallback) originalTrigger.apply(fallback.target, fallback.args);
}, STARTUP_TIMEOUT_MS);
document.addEventListener("click", onUserNavigation, true);
window.addEventListener("load", settleStartPage);

if (window.jQuery || window.$) {
  hookTrigger(window.jQuery || window.$);
} else {
  Object.defineProperty(window, "$", {
    configurable: true,
    get: () => undefined,
    set: (value) => {
      Object.defineProperty(window, "$", { configurable: true, writable: true, value });
      hookTrigger(value);
    }
  });
}
