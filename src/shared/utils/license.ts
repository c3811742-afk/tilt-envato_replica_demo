import type { Text } from '@/shared/constants';
import type { Locale } from '@/shared/theme';
import type { License } from '@/shared/types';
import { formatDate } from './format';

export const projectNameMaxLength = 80;

export type ProjectNameError = 'required' | 'tooLong';

// Validates the project name a subscriber enters before downloading. Returns null when it's valid.
export const validateProjectName = (value: string): ProjectNameError | null => {
  const trimmed = value.trim();
  if (!trimmed) return 'required';
  if (trimmed.length > projectNameMaxLength) return 'tooLong';
  return null;
};

// "3F2A-9C1E-5B7D-4E8A": a readable code that identifies one license.
export const createLicenseCode = () =>
  crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase().match(/.{4}/g)!.join('-');

// Plain-text license certificate in the active language.
export const buildLicenseCertificate = (license: License, text: Text, locale: Locale) => {
  const labels = text.license.certificate;
  return [
    labels.heading,
    '',
    `${labels.code}: ${license.code}`,
    `${labels.item}: ${license.itemTitle}`,
    `${labels.creator}: ${license.creatorName}`,
    `${labels.licensee}: ${license.licenseeName}`,
    `${labels.project}: ${license.projectName}`,
    `${labels.issued}: ${formatDate(license.issuedAt, locale)}`,
    '',
    labels.terms,
  ].join('\n');
};
