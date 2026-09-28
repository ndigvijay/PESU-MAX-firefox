import { load } from "../utils/storage.js";
import { TOP_BAR_KEY } from "../utils/storageKeys.js";
import { TOP_BAR_ATTR, TOP_BAR_MIRROR_KEY } from "./hideTopBar.js";

// Runs before the page parses, so the top bar is born hidden.
const hideTopBar = () => document.documentElement.setAttribute(TOP_BAR_ATTR, "");

const mirrored = () => {
  try {
    return localStorage.getItem(TOP_BAR_MIRROR_KEY);
  } catch (error) {
    return null;
  }
};

const flag = mirrored();

if (flag === "1") hideTopBar();
else if (flag === null) {
  load(TOP_BAR_KEY)
    .then((enabled) => {
      if (enabled) hideTopBar();
    })
    .catch(() => {});
}
