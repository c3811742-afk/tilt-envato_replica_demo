import type { ReorderButtonsProps } from './ReorderButtons.types';

export const reorderButtonsDefaults: Required<Pick<ReorderButtonsProps, 'canMoveUp' | 'canMoveDown' | 'disabled'>> = {
  canMoveUp: true,
  canMoveDown: true,
  disabled: false,
};
