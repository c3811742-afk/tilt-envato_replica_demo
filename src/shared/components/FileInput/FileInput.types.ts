import type { IconName } from '@/shared/assets';
import type { ButtonVariant } from '../Button';

export interface FileInputProps {
  label?: string; // the button text, e.g. "Upload an image"
  accept?: string; // file types, e.g. "image/*"
  onSelect?: (file: File) => void;
  hint?: string; // shown under the button
  error?: string; // shown in place of the hint
  busy?: string; // while the file is read: shown on the button, which is disabled
  icon?: IconName;
  variant?: ButtonVariant;
  disabled?: boolean;
}
