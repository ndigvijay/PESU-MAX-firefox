import { DEFAULT_DARK_ACCENT, darkAccentValue } from "./darkAccents.js";
import { DEFAULT_THEME_VALUE, FONT_OPTIONS, THEME_OPTIONS } from "./themePalettes.js";

export const THEME_ATTR = "data-pesu-max-theme";
export const DARK_ATTR = "data-pesu-max-dark";
export const DARK_ACCENT_ATTR = "data-pesu-max-dark-accent";
export const FONT_ATTR = "data-pesu-max-font";
const DARK_LOGO_PATH = "icons/pesu-logo-dark.png";

const optionFor = (options, value) =>
  options.find((option) => option.value === value && option.value !== DEFAULT_THEME_VALUE);

const asValue = (options, value) =>
  options.some((option) => option.value === value) ? value : DEFAULT_THEME_VALUE;

export const themeValues = (source) => ({
  theme: asValue(THEME_OPTIONS, source && source.theme),
  font: asValue(FONT_OPTIONS, source && source.font),
  dark: Boolean(source && source.dark),
  darkAccent: darkAccentValue(source && source.darkAccent),
});

const setVars = (root, vars) => {
  for (const [name, value] of Object.entries(vars)) {
    if (value) root.style.setProperty(name, value);
    else root.style.removeProperty(name);
  }
};

export function applyTheme(values) {
  const root = document.documentElement;


  const dark = values.dark === true;
  const palette = dark ? null : optionFor(THEME_OPTIONS, values.theme);
  if (palette) root.setAttribute(THEME_ATTR, palette.value);
  else root.removeAttribute(THEME_ATTR);
  if (dark) root.setAttribute(DARK_ATTR, "");
  else root.removeAttribute(DARK_ATTR);

  const darkAccent = dark ? darkAccentValue(values.darkAccent) : DEFAULT_DARK_ACCENT;
  if (darkAccent !== DEFAULT_DARK_ACCENT) root.setAttribute(DARK_ACCENT_ATTR, darkAccent);
  else root.removeAttribute(DARK_ACCENT_ATTR);
  setVars(root, {
    "--pesu-max-bg": palette && palette.background,
    "--pesu-max-accent": palette && palette.accent.base,
    "--pesu-max-accent-bright": palette && palette.accent.bright,
    "--pesu-max-accent-link": palette && palette.accent.link,
    "--pesu-max-accent-link-hover": palette && palette.accent.linkHover,
    "--pesu-max-dark-logo": dark && `url("${chrome.runtime.getURL(DARK_LOGO_PATH)}")`,
  });

  const font = optionFor(FONT_OPTIONS, values.font);
  if (font) root.setAttribute(FONT_ATTR, font.value);
  else root.removeAttribute(FONT_ATTR);
  setVars(root, { "--pesu-max-font": font && font.stack });
}
