import { auth, socialProviders, type SocialProvider } from '@/shared/constants';
import { fillText, isApiError, type FieldError } from '@/shared/utils';
import { useLocale } from './useLocale';

const isSocialProvider = (value: string): value is SocialProvider => (socialProviders as readonly string[]).includes(value);

// Turns error codes into friendly text in the active language. Technical details never reach the screen.
export const useMessages = () => {
  const { text } = useLocale();

  // A form field's validation error, e.g. 'passwordTooShort' -> "Use at least 8 characters."
  const fieldError = (error: FieldError | null | undefined) =>
    error ? fillText(text.validation[error], { min: auth.passwordMinLength, length: auth.codeLength }) : undefined;

  // A failed request: the server's explanation when it gave one, otherwise the generic "try again" message.
  const requestError = (error: unknown, fallback: string = text.states.error.message) => {
    if (!isApiError(error)) return fallback;
    const { provider } = error.values;
    const values = provider && isSocialProvider(provider) ? { provider: text.providers[provider] } : error.values;
    return fillText(text.apiErrors[error.code], values);
  };

  return { fieldError, requestError };
};
