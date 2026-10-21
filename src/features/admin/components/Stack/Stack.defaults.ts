import { vars } from '@/shared/theme';
import type { StackProps } from './Stack.types';

export const stackDefaults: Required<Pick<StackProps, 'as' | 'gap' | 'align'>> = {
  as: 'div',
  gap: vars.spacing[5],
  align: 'stretch',
};
