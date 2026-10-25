import { vars } from '@/shared/theme';
import type { OptionCardGroupProps } from './OptionCardGroup.types';

export const optionCardGroupDefaults: Required<
  Pick<OptionCardGroupProps<string>, 'options' | 'selectedBorderColor' | 'selectedBackground'>
> = {
  options: [],
  selectedBorderColor: vars.colors.primary,
  selectedBackground: vars.colors.surfaceMuted,
};
