const STYLE_ID = "pesu-max-material-columns-style";

export const MATERIAL_COLUMN_ATTR = "data-pesu-max-column";
export const MATERIAL_COLUMN_HIDDEN = "pesu-max-material-column-hidden";

// Hidden columns.
const CSS = `
  [${MATERIAL_COLUMN_ATTR}].${MATERIAL_COLUMN_HIDDEN} {
    display: none !important;
  }
`;

export function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
