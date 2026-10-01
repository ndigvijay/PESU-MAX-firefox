import { CSRF_META_SELECTOR, CSRF_REJECTED_EVENT } from "../academyPage.js";

const INSTALLED_ATTR = "data-pesu-max-csrf-sync";
const CSRF_HEADER = "X-CSRF-Token";
const REJECTED_STATUSES = [403, 500];

function applyToken(meta) {
  const $ = window.jQuery;
  const token = meta.getAttribute("content");
  if (!$ || !token) return;

  const headers = $.ajaxSettings.headers || {};
  if (headers[CSRF_HEADER] !== token) {
    $.ajaxSetup({ headers: { [CSRF_HEADER]: token } });
  }
}

function install() {
  const root = document.documentElement;
  const meta = document.querySelector(CSRF_META_SELECTOR);
  if (root.hasAttribute(INSTALLED_ATTR) || !meta) return;
  if (!window.jQuery) {
    window.addEventListener("load", install, { once: true });
    return;
  }
  root.setAttribute(INSTALLED_ATTR, "");

  applyToken(meta);
  new MutationObserver(() => applyToken(meta)).observe(meta, {
    attributes: true,
    attributeFilter: ["content"]
  });

  window.jQuery(document).ajaxError((event, xhr) => {
    if (REJECTED_STATUSES.includes(xhr.status)) {
      document.dispatchEvent(new CustomEvent(CSRF_REJECTED_EVENT));
    }
  });
}

install();
