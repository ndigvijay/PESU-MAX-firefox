import { load } from "../../utils/storage.js";
import {
  THEME_DARK_ACCENT_KEY,
  THEME_DARK_KEY,
  THEME_FONT_KEY,
  THEME_PALETTE_KEY,
} from "../../utils/storageKeys.js";
import { ACADEMY_APP_PATH_PREFIX } from "../academyPage.js";
import { applyTheme, themeValues } from "./themeApply.js";
import { readThemeMirror } from "./themeMirror.js";

const apply = (values) => applyTheme(themeValues(values));


if (location.pathname.startsWith(ACADEMY_APP_PATH_PREFIX)) {
  const mirrored = readThemeMirror();

  if (mirrored) apply(mirrored);
  else {
    Promise.all([
      load(THEME_PALETTE_KEY),
      load(THEME_FONT_KEY),
      load(THEME_DARK_KEY),
      load(THEME_DARK_ACCENT_KEY),
    ])
      .then(([theme, font, dark, darkAccent]) => apply({ theme, font, dark, darkAccent }))
      .catch(() => { });
  }
}
