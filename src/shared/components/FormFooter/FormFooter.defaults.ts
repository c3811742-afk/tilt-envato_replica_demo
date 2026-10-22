import type { FormFooterProps } from './FormFooter.types';

export const formFooterDefaults: Required<Pick<FormFooterProps, 'submitting' | 'variant'>> = {
  submitting: false,
  variant: 'primary',
};
