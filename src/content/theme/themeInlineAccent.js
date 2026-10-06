import { THEME_ATTR } from "./themeApply.js";

// PESU hard-codes its accent as an inline `color: #0091CD!important` on some links
// (e.g. material previews), which no stylesheet can override.
const HOST_ACCENT = "rgb(0, 145, 205)";
const HOST_ACCENT_SELECTOR = '[style*="0091cd" i]';
const RECOLORED_ATTR = "data-pesu-max-inline-accent";

function recolor(element) {
  if (element.style.getPropertyValue("color") !== HOST_ACCENT) return;

  element.setAttribute(RECOLORED_ATTR, element.style.getPropertyPriority("color"));
  element.style.setProperty("color", "var(--pesu-max-accent-bright)", "important");
}

function restore(element) {
  element.style.setProperty("color", HOST_ACCENT, element.getAttribute(RECOLORED_ATTR));
  element.removeAttribute(RECOLORED_ATTR);
}

export function applyInlineAccent() {
  if (document.documentElement.hasAttribute(THEME_ATTR)) {
    document.querySelectorAll(HOST_ACCENT_SELECTOR).forEach(recolor);
  } else {
    document.querySelectorAll(`[${RECOLORED_ATTR}]`).forEach(restore);
  }
}

export function watchInlineAccent() {
  let scheduled = false;

  new MutationObserver(() => {
    if (scheduled || !document.documentElement.hasAttribute(THEME_ATTR)) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      applyInlineAccent();
    });
  }).observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
}
