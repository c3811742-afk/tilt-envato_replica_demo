import type { ButtonVariant } from '../Button';

export interface FormFooterProps {
  label?: string; // the submit button's label; defaults to "Continue" in the active language
  submitting?: boolean; // the button is disabled and says "Processing…" while the request runs
  requestError?: unknown; // why the last request failed, explained above the button
  variant?: ButtonVariant;
}
