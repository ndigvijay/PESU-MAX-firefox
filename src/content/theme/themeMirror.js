export const THEME_MIRROR_KEY = "pesuMaxTheme";

export function readThemeMirror() {
  try {
    const raw = localStorage.getItem(THEME_MIRROR_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function writeThemeMirror(values) {
  try {
    localStorage.setItem(THEME_MIRROR_KEY, JSON.stringify(values));
  } catch (error) {
  }
}
