// Errors the (mock) server can answer with. Each code has a message in text.apiErrors.
export const apiErrorCodes = [
  'emailTaken',
  'invalidCredentials',
  'accountNotFound',
  'useSocialSignIn',
  'invalidCode',
  'codeExpired',
  'notSignedIn',
  'studentIdRequired',
  'nothingToConfirm',
  'wrongPassword',
  'lastSignInMethod',
  'providerLinkedElsewhere',
  'confirmationMismatch',
] as const;
export type ApiErrorCode = (typeof apiErrorCodes)[number];

// An expected failure with a code the UI can explain (unlike a crash or a network error).
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly values: Record<string, string>; // filled into the message, e.g. { provider: 'Google' }

  constructor(code: ApiErrorCode, values: Record<string, string> = {}) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.values = values;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
