import { CSRF_META_SELECTOR } from "../academyPage.js";

const INSTALLED_ATTR = "data-pesu-max-csrf-sync";
const CSRF_HEADER = "X-CSRF-Token";

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
  root.setAttribute(INSTALLED_ATTR, "");

  applyToken(meta);
  new MutationObserver(() => applyToken(meta)).observe(meta, {
    attributes: true,
    attributeFilter: ["content"]
  });
}

install();
