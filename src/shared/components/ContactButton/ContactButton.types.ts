import type { ButtonSize, ButtonVariant } from '../Button';

export interface ContactButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string; // defaults to "Contact us on WhatsApp" in the active language
}
