import { palette } from './colors';
import type { Direction } from './locales';

const hardOffset = 0.375; // rem (6px)
const liftOffset = 0.125; // rem (2px)

// Flat brand: no soft shadows. On hover an element lifts (`hardLift`) and casts `hard`.
// Both point toward the end of the reading direction, so they mirror in RTL.
export const buildShadows = (dir: Direction) => {
  const side = dir === 'rtl' ? -1 : 1;
  return {
    none: 'none',
    hard: `${side * hardOffset}rem ${hardOffset}rem 0 ${palette.black}`,
    hardLift: `translate(${-side * liftOffset}rem, ${-liftOffset}rem)`,
  } as const;
};
