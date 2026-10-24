import type { ContactButtonProps } from './ContactButton.types';

export const contactButtonDefaults: Required<Pick<ContactButtonProps, 'variant' | 'size'>> = {
  variant: 'secondary',
  size: 'md',
};
