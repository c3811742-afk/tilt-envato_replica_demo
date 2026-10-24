import type { FileInputProps } from './FileInput.types';

export const fileInputDefaults: Required<Pick<FileInputProps, 'accept' | 'multiple' | 'icon' | 'variant' | 'size' | 'disabled' | 'iconOnly'>> = {
  accept: '*/*',
  multiple: false,
  icon: 'upload',
  variant: 'outline',
  size: 'md',
  disabled: false,
  iconOnly: false,
};
