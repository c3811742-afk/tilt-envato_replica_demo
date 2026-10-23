export const motion = {
  ease: 'cubic-bezier(.2, .8, .2, 1)',
  none: '0s', // used when the user prefers reduced motion
  fast: '120ms',
  base: '200ms',
  spin: '800ms', // one spinner rotation
  hoverPreview: '6s', // a video card's moving preview while hovered
  slow: '400ms',
} as const;
