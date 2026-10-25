import {
  accentPairs,
  accentThemes,
  colors,
  darkColors,
  defaultAccentTheme,
  type AccentTheme,
  type ColorMode,
} from './colors';
import { typographyByLocale } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';
import { borders } from './borders';
import { buildShadows } from './shadows';
import { breakpoints } from './breakpoints';
import { zIndex } from './zIndex';
import { motion } from './motion';
import { opacity } from './opacity';
import { sizes } from './sizes';
import { locales, defaultLocale, type Locale } from './locales';

export interface ThemeOptions {
  locale: Locale;
  mode: ColorMode;
  accent: AccentTheme;
}

// The theme for a language, a light or dark mode and an accent color. Every combination has the same keys,
// so `vars` (built from the default theme) points to the right CSS variable whatever the user picked.
export const buildTheme = ({ locale, mode, accent }: ThemeOptions) => {
  const { lang, dir } = locales[locale];
  const themeColors: Record<keyof typeof colors, string> = {
    ...colors,
    ...(mode === 'dark' ? darkColors : {}),
    ...accentThemes[accent],
  };
  return {
    locale,
    lang,
    dir,
    colorScheme: mode, // tells the browser to draw its own controls (checkboxes, scrollbars) light or dark
    breakpoints,
    colors: themeColors,
    accentPairs,
    accentThemes, // every accent the user can pick, so the picker can show them all
    typography: typographyByLocale[locale],
    spacing,
    radii,
    borders,
    shadows: buildShadows(dir, themeColors.shadow, themeColors.overlay),
    zIndex,
    motion,
    opacity,
    sizes,
  };
};

export const defaultThemeOptions: ThemeOptions = { locale: defaultLocale, mode: 'light', accent: defaultAccentTheme };

export const theme = buildTheme(defaultThemeOptions);

export type Theme = ReturnType<typeof buildTheme>;
