import type { ChipGroupProps } from './ChipGroup.types';

export const chipGroupDefaults: Required<Pick<ChipGroupProps<string>, 'options' | 'value' | 'multiple'>> = {
  options: [],
  value: [],
  multiple: false,
};
