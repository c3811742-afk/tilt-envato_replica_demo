import { vars } from '@/shared/theme';
import type { ItemPickerProps } from './ItemPicker.types';

export const itemPickerDefaults: Required<Pick<ItemPickerProps, 'items' | 'selectedIds' | 'maxHeight'>> = {
  items: [],
  selectedIds: [],
  maxHeight: vars.sizes.picker.maxHeight,
};
