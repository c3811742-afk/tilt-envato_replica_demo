import { vars } from '@/shared/theme';
import type { StateMessageProps } from './StateMessage.types';

// Full height for a whole page, compact inside one section of a page (a row, a widget).
export const stateMessageHeights = {
  page: vars.sizes.stateMessage.minHeight,
  compact: vars.sizes.stateMessage.compactMinHeight,
};

export const stateMessageDefaults: Required<Pick<StateMessageProps, 'role' | 'minHeight' | 'maxWidth'>> = {
  role: 'status',
  minHeight: stateMessageHeights.page,
  maxWidth: vars.sizes.stateMessage.maxWidth,
};
