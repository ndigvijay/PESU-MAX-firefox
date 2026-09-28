import { load } from "../utils/storage.js";
import { TOP_BAR_KEY } from "../utils/storageKeys.js";
import {
  SIDE_MENU_HIDDEN,
  SIDE_MENU_SELECTOR,
  SIDE_MENU_STATE_ATTR
} from "./academyPage.js";
import { toggleSideMenuByUser } from "./sideMenuState.js";

export const TOGGLE_ROW_ID = "pesu-max-menu-toggle";

export const TOP_BAR_ATTR = "data-pesu-max-hide-top-bar";
export const TOP_BAR_MIRROR_KEY = "pesuMaxHideTopBar";

function applyHidden(enabled) {
  if (enabled) document.documentElement.setAttribute(TOP_BAR_ATTR, "");
  else document.documentElement.removeAttribute(TOP_BAR_ATTR);
}

function writeMirror(enabled) {
  try {
    localStorage.setItem(TOP_BAR_MIRROR_KEY, enabled ? "1" : "0");
  } catch (error) {
  }
}

// Add an entry in the side-menu. ONLY when the TOP_BAR_KEY is set.
function applyRow(enabled) {
  const existing = document.getElementById(TOGGLE_ROW_ID);

  if (!enabled) {
    if (existing) existing.remove();
    return;
  }

  if (existing) return;
  const list = document.querySelector(`${SIDE_MENU_SELECTOR} > ul`);
  if (!list) return;

  const row = document.createElement("li");
  row.id = TOGGLE_ROW_ID;

  const link = document.createElement("a");
  link.href = "javascript:void(0)";
  link.title = "Toggle side menu";
  link.setAttribute("aria-label", "Toggle side menu");
  link.innerHTML =
    '<span class="menu-image pesu-icon-menu-three"></span><span class="menu-name">Hide</span>';
  link.addEventListener("click", toggleSideMenuByUser);
  row.appendChild(link);

  const label = link.querySelector(".menu-name");
  const menu = document.querySelector(SIDE_MENU_SELECTOR);
  const collapsed = menu && menu.getAttribute(SIDE_MENU_STATE_ATTR) === SIDE_MENU_HIDDEN;
  label.style.display = collapsed ? "none" : "inline-block";

  list.insertBefore(row, list.querySelector("li"));
}

function apply(enabled) {
  applyHidden(enabled);
  applyRow(enabled);
  writeMirror(enabled);
}

// Off by default.
export async function initHideTopBar() {
  apply((await load(TOP_BAR_KEY)) === true);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[TOP_BAR_KEY]) return;
    apply(changes[TOP_BAR_KEY].newValue === true);
  });
}
