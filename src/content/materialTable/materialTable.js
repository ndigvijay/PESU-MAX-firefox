import { load } from "../../utils/storage.js";
import { MATERIAL_TABLE_KEY } from "../../utils/storageKeys.js";
import { MATERIAL_TABLE_ATTR, applyMaterialTable } from "./materialTableApply.js";

function setEnabled(enabled) {
  applyMaterialTable(enabled);
  if (enabled) document.documentElement.setAttribute(MATERIAL_TABLE_ATTR, "");
  else document.documentElement.removeAttribute(MATERIAL_TABLE_ATTR);
}

// Off by default
export async function initMaterialTable() {
  setEnabled((await load(MATERIAL_TABLE_KEY)) === true);

  let scheduled = false;
  const rescan = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (document.documentElement.hasAttribute(MATERIAL_TABLE_ATTR)) applyMaterialTable(true);
    });
  };

  new MutationObserver(rescan).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[MATERIAL_TABLE_KEY]) return;
    setEnabled(changes[MATERIAL_TABLE_KEY].newValue === true);
  });
}
