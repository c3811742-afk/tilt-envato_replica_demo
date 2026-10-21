export type AdminErrorCode = 'notAllowed' | 'notFound' | 'alreadyReviewed' | 'notLive' | 'emailTaken' | 'ownRole';

// An expected failure (e.g. "already reviewed"). Pages show the matching text from text.admin.errors.
export class AdminApiError extends Error {
  code: AdminErrorCode;

  constructor(code: AdminErrorCode) {
    super(code);
    this.name = 'AdminApiError';
    this.code = code;
  }
}

export const adminErrorCode = (error: unknown): AdminErrorCode | null =>
  error instanceof AdminApiError ? error.code : null;
