import { MENU_ITEM_ID_PREFIX, MENU_LIST_ID } from "../academyPage.js";
import theme from "../../../frontend/Themes/theme.jsx";

const STYLE_ID = "pesu-max-menu-reorder-style";
export const BAR_ID = "pesu-max-menu-edit-bar";
export const CLASS = "pesu-max-menu";
export const EDITING = `${CLASS}-editing`;
export const LOCKED = `${CLASS}-locked`;
export const DRAGGING = `${CLASS}-dragging`;
export const DROP_ABOVE = `${CLASS}-drop-above`;
export const DROP_BELOW = `${CLASS}-drop-below`;

export function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${MENU_LIST_ID}.${EDITING} {
      outline: 2px dashed ${theme.colors.primary};
      outline-offset: -2px;
      border-radius: 8px;
    }
    #${MENU_LIST_ID}.${EDITING} > li[id^="${MENU_ITEM_ID_PREFIX}"] { cursor: grab; }
    #${MENU_LIST_ID} > li.${LOCKED} { cursor: not-allowed; opacity: 0.65; }
    #${MENU_LIST_ID} > li.${DRAGGING} { cursor: grabbing; opacity: 0.5; }
    #${MENU_LIST_ID} > li.${DROP_ABOVE} { box-shadow: inset 0 3px 0 0 ${theme.colors.primary}; }
    #${MENU_LIST_ID} > li.${DROP_BELOW} { box-shadow: inset 0 -3px 0 0 ${theme.colors.primary}; }
    #${BAR_ID} {
      position: fixed;
      left: 16px;
      bottom: 16px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 520px;
      padding: 12px 14px;
      box-sizing: border-box;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #${BAR_ID} .${CLASS}-text { display: flex; flex-direction: column; gap: 2px; }
    #${BAR_ID} .${CLASS}-title {
      font-size: 14px;
      font-weight: 700;
      color: ${theme.colors.secondary};
    }
    #${BAR_ID} .${CLASS}-hint { font-size: 12px; color: #666666; }
    #${BAR_ID} button {
      flex: 0 0 auto;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1.5px solid ${theme.colors.secondary};
      background: ${theme.colors.secondary};
      color: ${theme.colors.onSolid};
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    #${BAR_ID} button.${CLASS}-lock {
      border-color: ${theme.colors.primary};
      background: ${theme.colors.primary};
      color: ${theme.colors.onSolid};
    }
    #${BAR_ID} button.${CLASS}-lock:hover:not(:disabled) { background: ${theme.colors.primaryHover}; }
    #${BAR_ID} button.${CLASS}-reset:hover:not(:disabled) { background: ${theme.colors.secondaryHover}; }
    #${BAR_ID} button:focus-visible {
      outline: 2px solid ${theme.colors.secondary};
      outline-offset: 2px;
    }
    #${BAR_ID} button:disabled {
      opacity: 0.55;
      cursor: default;
    }
  `;
  document.head.appendChild(style);
}
