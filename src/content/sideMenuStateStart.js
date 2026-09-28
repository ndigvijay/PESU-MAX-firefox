import { load } from "../utils/storage.js";
import { SIDE_MENU_COLLAPSED_KEY, SIDE_MENU_STATE_KEY } from "../utils/storageKeys.js";
import { SIDE_MENU_ATTR, SIDE_MENU_MIRROR_KEY } from "./sideMenuState.js";

// Runs before the page parses, so the menu stays collapsed.
const pinCollapsed = () => document.documentElement.setAttribute(SIDE_MENU_ATTR, "");

const mirrored = () => {
  try {
    return localStorage.getItem(SIDE_MENU_MIRROR_KEY);
  } catch (error) {
    return null;
  }
};

const flag = mirrored();

if (flag === "1") pinCollapsed();
else if (flag === null) {
  Promise.all([load(SIDE_MENU_STATE_KEY), load(SIDE_MENU_COLLAPSED_KEY)])
    .then(([enabled, collapsed]) => {
      if (enabled === true && collapsed === true) pinCollapsed();
    })
    .catch(() => {});
}
