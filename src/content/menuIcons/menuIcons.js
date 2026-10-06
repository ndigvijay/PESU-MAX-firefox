import { load } from "../../utils/storage.js";
import { MENU_ICONS_KEY } from "../../utils/storageKeys.js";
import { MENU_ICONS_ATTR, applyMenuIcons } from "./menuIconsApply.js";

const isEnabled = () => document.documentElement.hasAttribute(MENU_ICONS_ATTR);

function setEnabled(enabled) {
  applyMenuIcons(enabled);
  if (enabled) document.documentElement.setAttribute(MENU_ICONS_ATTR, "");
  else document.documentElement.removeAttribute(MENU_ICONS_ATTR);
}

// Off by default
export async function initMenuIcons() {
  setEnabled((await load(MENU_ICONS_KEY)) === true);

  let scheduled = false;
  const rescan = () => {
    if (scheduled || !isEnabled()) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (isEnabled()) applyMenuIcons(true);
    });
  };

  new MutationObserver(rescan).observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[MENU_ICONS_KEY]) return;
    setEnabled(changes[MENU_ICONS_KEY].newValue === true);
  });
}
