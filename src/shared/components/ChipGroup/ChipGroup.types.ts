import type { IconName } from '@/shared/assets';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

export interface ChipGroupProps<T extends string> {
  label?: string;
  options?: ChipOption<T>[];
  value?: T[]; // the selected values (one at most when `multiple` is off)
  onChange?: (value: T[]) => void;
  multiple?: boolean;
  hint?: string;
  error?: string;
}
