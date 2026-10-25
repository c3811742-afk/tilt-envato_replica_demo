// Raw brand palette, pixel-sampled from SYNC posts. The system uses SYNC blue and lime, plus neutrals, and red only for
// destructive actions and errors (danger). Components must not use it directly:
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
  lime: '#9AE62E',
  red: '#E8303C',
} as const;

export const colors = {
  primary: palette.royalBlue,
  primaryHover: palette.royalBlueDark,
  onPrimary: palette.white,
  secondary: palette.black,
  onSecondary: palette.white,
  highlight: palette.lime,
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
  focus: palette.black, // lime is too light to see on white

  danger: palette.red, // destructive actions (delete, ban) and errors
  onDanger: palette.white,
  success: palette.lime,
  onSuccess: palette.black,
  warning: palette.lime,
  onWarning: palette.black,
  info: palette.royalBlue,
  onInfo: palette.white,

  transparent: 'transparent', // see-through backgrounds and borders (ghost buttons)
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: palette.black, // the hard hover shadow

  // The admin sidebar: always SYNC blue with lime for the current page, whatever accent the user picked.
  nav: palette.royalBlue,
  onNav: palette.white,
  navHover: palette.royalBlueDark,
  navAccent: palette.lime,
  onNavAccent: palette.black,
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
  focus: palette.white,

  overlay: 'rgba(0, 0, 0, 0.8)',
  shadow: palette.white,
};

// The main brand color the user can pick: it replaces `primary` (buttons, links, the home banner).
export const accentThemes = {
  blue: { primary: palette.royalBlue, primaryHover: palette.royalBlueDark, onPrimary: palette.white },
  green: { primary: palette.lime, primaryHover: palette.lime, onPrimary: palette.black },
} as const satisfies Record<string, Partial<Record<ColorName, string>>>;

export type AccentTheme = keyof typeof accentThemes;
export const defaultAccentTheme: AccentTheme = 'blue';

// One accent per category / section: background + readable text on it.
export const accentPairs = {
  royalBlue: { bg: palette.royalBlue, text: palette.white },
  lime: { bg: palette.lime, text: palette.black },
  black: { bg: palette.black, text: palette.white },
} as const;

export type AccentName = keyof typeof accentPairs;
