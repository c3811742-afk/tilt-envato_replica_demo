import type { IconName } from '@/shared/assets';
import type { ButtonSize, ButtonVariant } from '../Button';

export interface FileInputProps {
  label?: string; // the button text, e.g. "Upload an image"
  accept?: string; // file types, e.g. "image/*"
  onSelect?: (file: File) => void;
  multiple?: boolean; // pick several files at once (they arrive in onSelectFiles)
  onSelectFiles?: (files: File[]) => void;
  hint?: string; // shown under the button
  error?: string; // shown in place of the hint
  busy?: string; // while the file is read: shown on the button, which is disabled
  icon?: IconName;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  iconOnly?: boolean; // just the icon, its label shown on hover (in a row of icon buttons); the hint isn't shown
}
