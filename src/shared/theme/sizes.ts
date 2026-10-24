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
  modal: { width: 'min(90vw, 32rem)', maxHeight: '85dvh' },
  header: { height: '4.5rem' }, // 72
  banner: { height: '3.5rem' }, // 56

  button: {
    height: { sm: '2.25rem', md: '3rem', lg: '3.5rem' }, // 36 / 48 / 56
    paddingX: spacing[5],
    gap: spacing[3],
  },
  input: { height: '3rem', paddingX: spacing[4] }, // 48
  textarea: { minHeight: '7.5rem' }, // 120
  checkbox: { size: '1.25rem' }, // 20
  mediaPreview: { maxHeight: '60dvh' }, // element previews never take more than most of the screen
  statCard: { minHeight: '8.5rem' }, // 136; dashboard number tiles line up in a row
  picker: { maxHeight: '20rem' }, // 320; long tick-box lists scroll inside this height
  tag: { height: '1.375rem', paddingX: spacing[2] }, // 22
  card: { padding: spacing[5], minWidth: 'min(17.5rem, 100%)' }, // 280, never wider than its column
  badge: { size: '5rem' }, // 80
  avatar: { sm: '2rem', md: '3rem', lg: '4rem', xl: '6rem' }, // 32 / 48 / 64 / 96
  icon: { sm: '1rem', md: '1.5rem', lg: '2rem' }, // 16 / 24 / 32
  spinner: { size: '2.5rem' }, // 40
  stateMessage: { minHeight: '40dvh', maxWidth: '32rem' }, // loading / error / empty / not found

  aspectRatio: {
    post: '4 / 5',
    story: '9 / 16',
    square: '1 / 1',
    video: '16 / 9',
  },
} as const;
