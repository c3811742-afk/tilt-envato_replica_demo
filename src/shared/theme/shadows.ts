import type { Direction } from './locales';

const hardOffset = 0.375; // rem (6px)
const liftOffset = 0.125; // rem (2px)

// Flat brand: no soft shadows. On hover an element lifts (`hardLift`) and casts `hard`.
// Both point toward the end of the reading direction, so they mirror in RTL. `color` follows light / dark mode.
export const buildShadows = (dir: Direction, color: string) => {
  const side = dir === 'rtl' ? -1 : 1;
  return {
    none: 'none',
    hard: `${side * hardOffset}rem ${hardOffset}rem 0 ${color}`,
    hardLift: `translate(${-side * liftOffset}rem, ${-liftOffset}rem)`,
  } as const;
};
