// Line icons on a 24 x 24 grid, drawn with `currentColor` by the shared Icon component.
// Each icon is a list of SVG path strings.
const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const rect = (x: number, y: number, width: number, height: number) => `M${x} ${y}h${width}v${height}h${-width}z`;

export const icons = {
  // Navigation
  home: ['M3 9l9-7 9 7v13H3z', 'M9 22V12h6v10'],
  search: [circle(11, 11, 8), 'M21 21l-4.3-4.3'],
  grid: [rect(3, 3, 7, 7), rect(14, 3, 7, 7), rect(14, 14, 7, 7), rect(3, 14, 7, 7)],
  tag: ['M12 2H2v10l10 10 10-10z', circle(7, 7, 1.5)],
  help: [circle(12, 12, 10), 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3', 'M12 17h.01'],
  info: [circle(12, 12, 10), 'M12 16v-4', 'M12 8h.01'],
  globe: [circle(12, 12, 10), 'M2 12h20', 'M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z'],
  user: [circle(12, 8, 4), 'M20 21a8 8 0 0 0-16 0'],
  users: [circle(9, 7, 4), 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M22 21v-2a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'],
  graduation: ['M22 10L12 5 2 10l10 5z', 'M6 12v5c3 3 9 3 12 0v-5'],

  // Actions
  download: ['M21 15v6H3v-6', 'M7 10l5 5 5-5', 'M12 15V3'],
  close: ['M18 6L6 18', 'M6 6l12 12'],
  copy: [rect(8, 8, 14, 14), 'M4 16H2V2h14v2'],
  check: ['M20 6L9 17l-5-5'],
  more: [circle(5, 12, 1), circle(12, 12, 1), circle(19, 12, 1)], // three dots: opens a menu of more actions
  chevronDown: ['M6 9l6 6 6-6'],
  chevronUp: ['M18 15l-6-6-6 6'],
  chevronEnd: ['M9 18l6-6-6-6'], // points to the end of the line: flip in RTL
  chevronStart: ['M15 18l-6-6 6-6'], // points to the start of the line: flip in RTL
  arrowEnd: ['M5 12h14', 'M12 5l7 7-7 7'], // flip in RTL
  message: ['M7.9 20A9 9 0 1 0 4 16.1L2 22z'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', circle(12, 12, 3)],
  eyeOff: ['M10.7 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2', 'M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6', 'M9.9 9.9a3 3 0 0 0 4.2 4.2', 'M2 2l20 20'],
  logOut: ['M9 21H3V3h6', 'M16 17l5-5-5-5', 'M21 12H9'], // flip in RTL
  mail: [rect(2, 4, 20, 16), 'M2 6l10 7 10-7'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.9 1.9 0 0 0 3.4 0'],
  sun: [circle(12, 12, 4), 'M12 2v2', 'M12 20v2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M2 12h2', 'M20 12h2', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
  moon: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'],
  link: ['M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7', 'M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'],
  bookmark: ['M19 21l-7-5-7 5V3h14z'],
  flag: ['M4 22V4', 'M4 4h13l-2 4 2 4H4'],
  folder: ['M22 19V7H12l-2-3H2v15z'],
  plus: ['M12 5v14', 'M5 12h14'],
  trash: ['M3 6h18', 'M8 6V3h8v3', 'M19 6l-1 15H6L5 6', 'M10 11v6', 'M14 11v6'],
  pencil: ['M17 3l4 4L8 20H4v-4z', 'M14 6l4 4'],
  pin: ['M12 17v5', 'M9 3h6l-1 6 4 4v2H6v-2l4-4z'],
  share: [circle(18, 5, 3), circle(6, 12, 3), circle(18, 19, 3), 'M8.6 13.5l6.8 4', 'M15.4 6.5l-6.8 4'],
  // Social media (line versions that follow the text color)
  instagram: ['M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z', circle(12, 12, 4), 'M17.5 6.5h.01'],
  facebook: ['M15 3h-3a4 4 0 0 0-4 4v3H6v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z'],
  youtube: ['M2.5 7.5A3 3 0 0 1 5 5c3-.5 11-.5 14 0a3 3 0 0 1 2.5 2.5c.5 3 .5 6 0 9A3 3 0 0 1 19 19c-3 .5-11 .5-14 0a3 3 0 0 1-2.5-2.5c-.5-3-.5-6 0-9z', 'M10 9l5 3-5 3z'],
  tiktok: ['M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5', 'M14 3c.5 3 2.5 5 5.5 5'],
  linkedin: [rect(2, 9, 4, 12), circle(4, 4, 2), 'M10 21v-7a4 4 0 0 1 8 0v7', 'M10 9v12', 'M18 21h4v-7a6 6 0 0 0-6-6'],
  x: ['M4 4l16 16', 'M20 4L4 20'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'M9 12l2 2 4-4'],
  upload: ['M21 15v6H3v-6', 'M17 8l-5-5-5 5', 'M12 3v12'],
  camera: ['M23 19V8h-5l-2-3H8L6 8H1v11z', circle(12, 13, 4)],
  filter: ['M4 6h16', 'M7 12h10', 'M10 18h4'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  mapPin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z', circle(12, 10, 3)],
  clock: [circle(12, 12, 10), 'M12 6v6l4 2'],
  sparkle: ['M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z'],

  // Item details
  star: ['M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2 1.2-6.8-5-4.9 6.9-1z'],
  play: ['M6 3l14 9-14 9z'],
  pause: [rect(6, 4, 4, 16), rect(14, 4, 4, 16)],
  volume: ['M11 5L6 9H2v6h4l5 4z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M19 5a10 10 0 0 1 0 14'],
  volumeOff: ['M11 5L6 9H2v6h4l5 4z', 'M23 9l-6 6', 'M17 9l6 6'],
  fullscreen: ['M8 3H3v5', 'M21 8V3h-5', 'M16 21h5v-5', 'M3 16v5h5'],
  fullscreenExit: ['M3 8h5V3', 'M16 3v5h5', 'M21 16h-5v5', 'M8 21v-5H3'],
  alignStart: ['M3 6h18', 'M3 10h12', 'M3 14h18', 'M3 18h12'],
  alignCenter: ['M3 6h18', 'M6 10h12', 'M3 14h18', 'M6 18h12'],
  alignEnd: ['M3 6h18', 'M9 10h12', 'M3 14h18', 'M9 18h12'],
  license: ['M15 2H4v20h16V7z', 'M14 2v6h6', 'M9 15l2 2 4-4'],
  infinity: ['M12 12c-2-2.7-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.3 6-4zm0 0c2 2.7 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.3-6 4z'],
  refresh: ['M3 12a9 9 0 0 1 15.7-6.3L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-15.7 6.3L3 16', 'M8 16H3v5'],
  layers: ['M12 2l10 5-10 5L2 7z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],

  // Categories
  video: [rect(2, 4, 20, 16), 'M10 9l5 3-5 3z'],
  film: [rect(3, 3, 18, 18), 'M7 3v18', 'M17 3v18', 'M3 7.5h4', 'M3 12h18', 'M3 16.5h4', 'M17 7.5h4', 'M17 16.5h4'],
  music: ['M9 18V5l12-2v13', circle(6, 18, 3), circle(18, 16, 3)],
  waves: ['M2 10v4', 'M6 6v12', 'M10 3v18', 'M14 8v8', 'M18 5v14', 'M22 10v4'],
  type: ['M4 7V4h16v3', 'M9 20h6', 'M12 4v16'],
  shapes: ['M12 2l5 8H7z', circle(7, 17, 4), rect(13, 13, 8, 8)],
  layout: [rect(3, 3, 18, 18), 'M3 9h18', 'M9 21V9'],
  image: [rect(3, 3, 18, 18), circle(9, 9, 2), 'M21 15l-5-5L5 21'],
  presentation: ['M2 3h20', 'M21 3v13H3V3', 'M7 21l5-5 5 5'],
  code: ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6'],

  // Occasions and business types
  heart: ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z'],
  ring: [circle(12, 15, 7), 'M9 4h6l-1.5 4h-3z'],
  gift: [rect(3, 8, 18, 4), 'M5 12v10h14V12', 'M12 8v14', 'M12 8H8a2.5 2.5 0 0 1 0-5c3 0 4 5 4 5z', 'M12 8h4a2.5 2.5 0 0 0 0-5c-3 0-4 5-4 5z'],
  flower: [circle(12, 9, 3), 'M12 12v10', 'M12 6a3 3 0 1 1 3-3', 'M9 9a3 3 0 1 1-3-3', 'M15 9a3 3 0 1 0 3-3', 'M12 18c-3 0-5-2-5-4 3 0 5 2 5 4z'],
  utensils: ['M3 2v7a3 3 0 0 0 6 0V2', 'M6 2v20', 'M21 15V2a5 5 0 0 0-5 5v6h5', 'M21 15v7'],
  pill: ['M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7z', 'M8.5 8.5l7 7'],
  medical: [rect(3, 3, 18, 18), 'M12 7v10', 'M7 12h10'],
  building: [rect(4, 2, 16, 20), 'M9 22v-4h6v4', 'M8 6h.01', 'M16 6h.01', 'M12 6h.01', 'M8 10h.01', 'M16 10h.01', 'M12 10h.01', 'M8 14h.01', 'M16 14h.01', 'M12 14h.01'],
  scissors: [circle(6, 6, 3), circle(6, 18, 3), 'M20 4L8.1 15.9', 'M14.5 14.5L20 20', 'M8.1 8.1L12 12'],
  dumbbell: ['M6 7v10', 'M18 7v10', 'M3 10v4', 'M21 10v4', 'M6 12h12'],
  bag: ['M6 2L3 6v16h18V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],

  // Payment methods
  card: [rect(2, 5, 20, 14), 'M2 10h20'],
  wallet: ['M19 7V3H4a2 2 0 0 0 0 4h17v4', 'M3 5v16h18v-4', 'M21 11h-4a2 2 0 0 0 0 4h4z'],
  phone: [rect(5, 2, 14, 20), 'M12 18h.01'],
  receipt: ['M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z', 'M8 8h8', 'M8 12h8', 'M8 16h5'],
  calendar: [rect(3, 4, 18, 18), 'M16 2v4', 'M8 2v4', 'M3 10h18'],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof icons;

// Directional icons that mirror in right-to-left languages. Logos, play buttons and checkmarks don't.
export const directionalIcons: readonly IconName[] = ['chevronEnd', 'chevronStart', 'arrowEnd', 'logOut'];
