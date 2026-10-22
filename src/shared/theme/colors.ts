// Raw brand palette, pixel-sampled from SYNC posts. Components must not use it directly:
// use `colors` (semantic) or `accentPairs` instead.
export const palette = {
  black: '#000000',
  white: '#FFFFFF',
  gray100: '#EBEBEB',
  gray200: '#DDDDDD',
  gray400: '#A3A3A3',
  gray500: '#767676',
  gray800: '#2E2E2E',
  gray900: '#1C1C1C',
  royalBlue: '#403AFE',
  royalBlueDark: '#3A32E0',
  skyBlue: '#4393F2',
  mint: '#84FED9',
  hotPink: '#FF55C7',
  lightPink: '#F384CF',
  purple: '#6D0175',
  red: '#E8303C',
  lime: '#9AE62E',
  yellow: '#FEE600',
  orange: '#FE8013',
  forest: '#10572B',
  green: '#22A045',
  teal: '#14A3A3',
  brown: '#8A5A2E',
} as const;

export const colors = {
  primary: palette.royalBlue,
  primaryHover: palette.royalBlueDark,
  onPrimary: palette.white,
  secondary: palette.black,
  onSecondary: palette.white,
  highlight: palette.yellow,
  onHighlight: palette.black,

  background: palette.white,
  surface: palette.white,
  surfaceMuted: palette.gray100,
  surfaceInverse: palette.black,

  text: palette.black,
  textMuted: palette.gray500,
  textInverse: palette.white,

  border: palette.black,
  borderMuted: palette.gray200,
  focus: palette.yellow,

  danger: palette.red,
  onDanger: palette.white,
  success: palette.lime,
  onSuccess: palette.black,
  warning: palette.orange,
  onWarning: palette.black,
  info: palette.skyBlue,
  onInfo: palette.white,

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: palette.black, // the hard hover shadow
} as const;

export type ColorName = keyof typeof colors;

// Light is the default look (`colors`). Dark mode replaces only the colors listed here.
export const colorModes = ['light', 'dark'] as const;
export type ColorMode = (typeof colorModes)[number];

export const darkColors: Partial<Record<ColorName, string>> = {
  secondary: palette.white,
  onSecondary: palette.black,

  background: palette.black,
  surface: palette.gray900,
  surfaceMuted: palette.gray800,
  surfaceInverse: palette.gray800,

  text: palette.white,
  textMuted: palette.gray400,
  textInverse: palette.white,

  border: palette.white,
  borderMuted: palette.gray800,

  overlay: 'rgba(0, 0, 0, 0.8)',
  shadow: palette.white,
};

// The main brand color the user can pick: it replaces `primary` (buttons, links, the home banner).
export const accentThemes = {
  blue: { primary: palette.royalBlue, primaryHover: palette.royalBlueDark, onPrimary: palette.white },
  pink: { primary: palette.hotPink, primaryHover: palette.lightPink, onPrimary: palette.black },
  green: { primary: palette.lime, primaryHover: palette.lime, onPrimary: palette.black },
  orange: { primary: palette.orange, primaryHover: palette.orange, onPrimary: palette.black },
  purple: { primary: palette.purple, primaryHover: palette.purple, onPrimary: palette.white },
} as const satisfies Record<string, Partial<Record<ColorName, string>>>;

export type AccentTheme = keyof typeof accentThemes;
export const defaultAccentTheme: AccentTheme = 'blue';

// One accent per category / section: background + readable text on it.
export const accentPairs = {
  royalBlue: { bg: palette.royalBlue, text: palette.white },
  skyBlue: { bg: palette.skyBlue, text: palette.white },
  mint: { bg: palette.mint, text: palette.black },
  hotPink: { bg: palette.hotPink, text: palette.black },
  purple: { bg: palette.purple, text: palette.white },
  red: { bg: palette.red, text: palette.white },
  lime: { bg: palette.lime, text: palette.black },
  yellow: { bg: palette.yellow, text: palette.black },
  orange: { bg: palette.orange, text: palette.black },
  forest: { bg: palette.forest, text: palette.white },
} as const;

export type AccentName = keyof typeof accentPairs;

// The colors of the search color filter: the swatch, and a readable check mark on it.
export const colorSwatches = {
  red: { bg: palette.red, text: palette.white },
  orange: { bg: palette.orange, text: palette.black },
  yellow: { bg: palette.yellow, text: palette.black },
  green: { bg: palette.green, text: palette.white },
  teal: { bg: palette.teal, text: palette.white },
  blue: { bg: palette.royalBlue, text: palette.white },
  purple: { bg: palette.purple, text: palette.white },
  pink: { bg: palette.hotPink, text: palette.black },
  brown: { bg: palette.brown, text: palette.white },
  black: { bg: palette.black, text: palette.white },
  white: { bg: palette.white, text: palette.black },
  gray: { bg: palette.gray400, text: palette.black },
} as const;

export type ColorSwatchName = keyof typeof colorSwatches;
