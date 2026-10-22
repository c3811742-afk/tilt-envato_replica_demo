import type { ReactNode } from 'react';
import type { IconName } from '@/shared/assets';

export interface OptionCard<T extends string> {
  value: T;
  title: string;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
  disabledReason?: string; // shown instead of the description when the option is disabled
}

export interface OptionCardGroupProps<T extends string> {
  label?: string; // accessible name of the group
  options?: OptionCard<T>[];
  value?: T;
  onChange?: (value: T) => void;
  children?: ReactNode; // details for the selected option (e.g. its form), shown under it
  selectedBorderColor?: string;
  selectedBackground?: string;
}
