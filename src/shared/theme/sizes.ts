import { spacing } from './spacing';

// Default widths and heights. Fixed sizes are in rem (they scale with the root font size);
// layout sizes are relative to the viewport (%, vw, dvh) so pages adapt to any screen.
export const sizes = {
  container: {
    width: '100%',
    maxWidth: '75rem', // 1200
    paddingX: `clamp(${spacing[4]}, 4vw, ${spacing[5]})`,
  },
  viewport: {
    fullHeight: '100dvh',
    heroMinHeight: '60dvh',
  },
  sidebar: { width: 'clamp(15rem, 22vw, 18rem)' },
  splitLayout: { columns: '3fr 2fr' }, // main content and side panel on desktop (checkout, item page)
  modal: { width: 'min(90vw, 32rem)', maxHeight: '85dvh' },
  authForm: { maxWidth: '28rem' }, // sign in, sign up and the other onboarding forms
  dropdown: { width: 'min(90vw, 18rem)' }, // account menu
  header: { height: '4.5rem' }, // 72
  banner: { height: '3.5rem' }, // 56
  bottomNav: { height: '4rem' }, // 64, phone tab bar
  readable: { maxWidth: '45rem' }, // long text (FAQ, how it works)
  hero: { maxWidth: '50rem' }, // home banner text and search

  button: {
    height: { sm: '2.25rem', md: '3rem', lg: '3.5rem' }, // 36 / 48 / 56
    paddingX: spacing[5],
    gap: spacing[3],
  },
  input: { height: '3rem', paddingX: spacing[4] }, // 48
  searchBar: { height: { md: '3rem', lg: '3.75rem' } }, // 48 / 60
  chip: { height: '2.5rem', paddingX: spacing[4], rowWidth: 'auto' }, // 40; in a scrolling row each chip is as wide as its label
  segment: { height: { sm: '2.5rem', md: '2.75rem' }, paddingX: spacing[4] }, // 40 / 44
  tag: { height: '1.375rem', paddingX: spacing[2] }, // 22
  card: { padding: spacing[5], minWidth: 'min(17.5rem, 100%)' }, // 280, never wider than its column
  // Grid column width for each grid size the user can pick (search results), and the width in a scrolling row.
  itemCard: {
    minWidth: { small: 'min(11rem, 100%)', medium: 'min(15rem, 100%)', large: 'min(22rem, 100%)' },
    railWidth: 'min(16rem, 72vw)',
  },
  collectionCard: { minWidth: 'min(20rem, 100%)' },
  // Music and sound effects list: cover thumbnail, waveform height, the columns for duration and BPM.
  track: { thumb: '3rem', waveform: '2.5rem', meta: '4.5rem', name: '14rem', barGap: '0.0625rem' }, // 48 / 40 / 72 / 224 / 1
  player: { waveform: '4.5rem', time: '6.5rem' }, // 72 / 104: item page audio waveform, "1:05 / 2:30" label
  slider: { thumb: '1.25rem', volume: 'min(8rem, 30vw)' }, // 20, volume slider width
  thumbnail: '4rem', // 64, a reference image in "search by image"
  // A video preview's slow zoom and drift (the "Ken Burns" move) over its whole length.
  stage: { zoom: '1.18', drift: '-4%' },
  suggestions: { maxHeight: 'min(60dvh, 24rem)' },
  tour: { width: 'min(90vw, 22rem)' }, // the card next to a highlighted element
  categoryCard: { minWidth: 'min(10rem, 100%)' },
  // Generated item cover art: icon size, the decorative shape (size, how far it bleeds off the corner, tilt) and title width.
  cover: {
    icon: 'clamp(2.5rem, 12%, 4.5rem)',
    shape: '45%',
    shapeBleedBlock: '-15%',
    shapeBleedInline: '-8%',
    shapeTilt: '15deg',
    titleMaxWidth: '80%',
  },
  badge: { size: '5rem' }, // 80
  avatar: { sm: '2rem', md: '3rem', lg: '4rem', xl: '6rem' }, // 32 / 48 / 64 / 96
  icon: { sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' }, // 16 / 24 / 32 / 48
  tapTarget: '2.75rem', // 44, smallest touch target
  swatch: '2.25rem', // 36, a color choice in the appearance menu
  spinner: { size: '2.5rem' }, // 40
  stateMessage: { minHeight: '40dvh', compactMinHeight: '15rem', maxWidth: '32rem' }, // loading / error / empty / not found; compact inside a page section

  aspectRatio: {
    post: '4 / 5',
    story: '9 / 16',
    square: '1 / 1',
    video: '16 / 9',
  },
} as const;
