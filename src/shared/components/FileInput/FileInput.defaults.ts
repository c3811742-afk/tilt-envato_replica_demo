import type { FileInputProps } from './FileInput.types';

export const fileInputDefaults: Required<Pick<FileInputProps, 'accept' | 'icon' | 'variant' | 'size' | 'disabled' | 'iconOnly'>> = {
  accept: '*/*',
  icon: 'upload',
  variant: 'outline',
  size: 'md',
  disabled: false,
  iconOnly: false,
};
