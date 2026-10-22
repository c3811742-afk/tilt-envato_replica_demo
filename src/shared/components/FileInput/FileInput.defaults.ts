import type { FileInputProps } from './FileInput.types';

export const fileInputDefaults: Required<Pick<FileInputProps, 'accept' | 'icon' | 'variant' | 'disabled'>> = {
  accept: '*/*',
  icon: 'upload',
  variant: 'outline',
  disabled: false,
};
