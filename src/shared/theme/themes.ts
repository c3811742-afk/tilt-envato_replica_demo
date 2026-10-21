import { colors, accentPairs } from './colors';
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

const buildTheme = (locale: Locale) => {
  const { lang, dir } = locales[locale];
  return {
    locale,
    lang,
    dir,
    breakpoints,
    colors,
    accentPairs,
    typography: typographyByLocale[locale],
    spacing,
    radii,
    borders,
    shadows: buildShadows(dir),
    zIndex,
    motion,
    opacity,
    sizes,
  };
};

// One theme per language. The active one is chosen by the app's current locale.
export const themes = {
  en: buildTheme('en'),
  ar: buildTheme('ar'),
} as const;

export const theme = themes[defaultLocale];

export type Theme = ReturnType<typeof buildTheme>;
