import { DEFAULT_THEME_VALUE, FONT_OPTIONS, THEME_OPTIONS } from "./themePalettes.js";

export const THEME_ATTR = "data-pesu-max-theme";
export const FONT_ATTR = "data-pesu-max-font";

const optionFor = (options, value) =>
  options.find((option) => option.value === value && option.value !== DEFAULT_THEME_VALUE);

const asValue = (options, value) =>
  options.some((option) => option.value === value) ? value : DEFAULT_THEME_VALUE;

export const themeValues = (source) => ({
  theme: asValue(THEME_OPTIONS, source && source.theme),
  font: asValue(FONT_OPTIONS, source && source.font),
});

const setVars = (root, vars) => {
  for (const [name, value] of Object.entries(vars)) {
    if (value) root.style.setProperty(name, value);
    else root.style.removeProperty(name);
  }
};

export function applyTheme(values) {
  const root = document.documentElement;

  const palette = optionFor(THEME_OPTIONS, values.theme);
  if (palette) root.setAttribute(THEME_ATTR, palette.value);
  else root.removeAttribute(THEME_ATTR);
  setVars(root, {
    "--pesu-max-bg": palette && palette.background,
    "--pesu-max-accent": palette && palette.accent.base,
    "--pesu-max-accent-bright": palette && palette.accent.bright,
    "--pesu-max-accent-link": palette && palette.accent.link,
    "--pesu-max-accent-link-hover": palette && palette.accent.linkHover,
  });

  const font = optionFor(FONT_OPTIONS, values.font);
  if (font) root.setAttribute(FONT_ATTR, font.value);
  else root.removeAttribute(FONT_ATTR);
  setVars(root, { "--pesu-max-font": font && font.stack });
}
