import type { Locale } from './locales';

// Closest Google Fonts matches to the SYNC lettering. Load `fontsUrl` once, globally.
export const fontsUrl =
  'https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,700;0,800;0,900;1,800;1,900&family=Cairo:wght@400;700;900&family=Lalezar&family=Space+Mono:wght@400;700&display=swap';

// Each stack falls back to the other script's font, so mixed English/Arabic text renders correctly.
const fontStack = {
  archivo: "'Archivo', 'Cairo', 'Arial Black', sans-serif",
  cairo: "'Cairo', 'Archivo', sans-serif",
  lalezar: "'Lalezar', 'Cairo', sans-serif",
  mono: "'Space Mono', 'Cairo', monospace",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  bold: 700,
  extraBold: 800,
  black: 900,
} as const;

// Every rem in the theme scales from this. It never drops below the browser default (100%),
// and grows slightly on large screens so the whole layout scales with it.
export const rootFontSize = 'clamp(100%, 0.875rem + 0.25vw, 112.5%)';

// Large sizes are fluid: they shrink on small screens and stop at their max.
export const fontSize = {
  xs: '0.75rem', // 12
  sm: '0.875rem', // 14
  md: '1rem', // 16
  lg: '1.25rem', // 20
  xl: '1.5rem', // 24
  xxl: 'clamp(1.5rem, 1.25rem + 1.5vw, 2rem)', // 24–32
  xxxl: 'clamp(2rem, 1.5rem + 2.5vw, 2.5rem)', // 32–40
  display: 'clamp(2.5rem, 6vw, 4rem)', // 40–64
} as const;

// Arabic needs more line height, no letter spacing, no uppercase, and Lalezar has a single weight.
const localeTypography = {
  en: {
    fontFamily: { display: fontStack.archivo, body: fontStack.archivo, mono: fontStack.mono },
    displayWeight: fontWeight.black,
    lineHeight: { tight: 1.05, snug: 1.25, body: 1.5 },
    letterSpacing: { normal: '0', caps: '0.01em', wide: '0.06em' },
    caps: 'uppercase',
  },
  ar: {
    fontFamily: { display: fontStack.lalezar, body: fontStack.cairo, mono: fontStack.mono },
    displayWeight: fontWeight.regular,
    lineHeight: { tight: 1.3, snug: 1.5, body: 1.8 },
    letterSpacing: { normal: '0', caps: '0', wide: '0' },
    caps: 'none',
  },
} as const;

const buildTypography = (locale: Locale) => {
  const { fontFamily, displayWeight, lineHeight, letterSpacing, caps } = localeTypography[locale];

  const textStyle = (
    family: keyof typeof fontFamily,
    size: keyof typeof fontSize,
    weight: number,
    height: keyof typeof lineHeight,
    transform: string = 'none',
    spacing: keyof typeof letterSpacing = 'normal',
  ) => ({
    fontFamily: fontFamily[family],
    fontSize: fontSize[size],
    fontWeight: weight,
    lineHeight: lineHeight[height],
    textTransform: transform,
    letterSpacing: letterSpacing[spacing],
  });

  // Named text styles. Components pick a style, then override single props if needed.
  const textStyles = {
    display: textStyle('display', 'display', displayWeight, 'tight', caps, 'caps'),
    h1: textStyle('display', 'xxxl', displayWeight, 'tight', caps, 'caps'),
    h2: textStyle('display', 'xxl', displayWeight, 'tight', caps, 'caps'),
    h3: textStyle('display', 'xl', displayWeight, 'snug', caps),
    h4: textStyle('body', 'lg', fontWeight.bold, 'snug', caps),
    body: textStyle('body', 'md', fontWeight.regular, 'body'),
    bodySm: textStyle('body', 'sm', fontWeight.regular, 'body'),
    caption: textStyle('body', 'xs', fontWeight.bold, 'snug', caps),
    label: textStyle('mono', 'xs', fontWeight.bold, 'snug', caps, 'wide'),
    button: textStyle('display', 'md', displayWeight, 'tight', caps, 'caps'),
  };

  return { rootFontSize, fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, textStyles };
};

export const typographyByLocale = {
  en: buildTypography('en'),
  ar: buildTypography('ar'),
} as const;

export type Typography = ReturnType<typeof buildTypography>;
