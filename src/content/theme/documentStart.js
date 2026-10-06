import { load } from "../../utils/storage.js";
import { THEME_FONT_KEY, THEME_PALETTE_KEY } from "../../utils/storageKeys.js";
import { ACADEMY_APP_PATH_PREFIX } from "../academyPage.js";
import { applyTheme, themeValues } from "./themeApply.js";
import { readThemeMirror } from "./themeMirror.js";

const apply = (values) => applyTheme(themeValues(values));


if (location.pathname.startsWith(ACADEMY_APP_PATH_PREFIX)) {
  const mirrored = readThemeMirror();

  if (mirrored) apply(mirrored);
  else {
    Promise.all([load(THEME_PALETTE_KEY), load(THEME_FONT_KEY)])
      .then(([theme, font]) => apply({ theme, font }))
      .catch(() => { });
  }
}
