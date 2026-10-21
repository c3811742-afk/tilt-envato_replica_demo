// Raw brand palette, pixel-sampled from SYNC posts. Components must not use it directly:
// use `colors` (semantic) or `accentPairs` instead.
export const palette = {
  black: '#000000',
  white: '#FFFFFF',
  gray100: '#EBEBEB',
  gray200: '#DDDDDD',
  gray500: '#767676',
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
} as const;

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
