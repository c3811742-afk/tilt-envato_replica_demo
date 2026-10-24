import { vars } from '@/shared/theme';
import type { StackProps } from './Stack.types';

export const stackDefaults: Required<Pick<StackProps, 'as' | 'direction' | 'gap' | 'align'>> = {
  as: 'div',
  direction: 'column',
  gap: vars.spacing[5],
  align: 'stretch',
};
