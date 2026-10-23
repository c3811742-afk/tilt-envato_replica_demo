import { licenseCheckPath, type Text } from '@/shared/constants';
import type { Locale } from '@/shared/theme';
import type { License, YoutubeChannel } from '@/shared/types';
import { fillText } from './fillText';
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

// A full link to a page of this app (HashRouter), e.g. for a license check link printed on a certificate.
export const appUrl = (path: string) => `${window.location.origin}${window.location.pathname}#${path}`;

// Plain-text license certificate in the active language, with the link anyone can use to check it.
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
    `${labels.use}: ${text.license.uses[license.use]}`,
    `${labels.issued}: ${formatDate(license.issuedAt, locale)}`,
    '',
    labels.terms,
    '',
    fillText(text.proofLetter.check, { link: appUrl(licenseCheckPath(license.code)) }),
  ].join('\n');
};

// Several certificates in one file ("Download all licenses").
export const buildLicensesFile = (licenses: License[], text: Text, locale: Locale) =>
  licenses.map((license) => buildLicenseCertificate(license, text, locale)).join('\n\n----------\n\n');

// A letter that proves a music license, for disputing a YouTube Content ID claim.
export const buildProofLetter = (license: License, channels: YoutubeChannel[], text: Text, locale: Locale) => {
  const letter = text.proofLetter;
  return [
    letter.title,
    '',
    formatDate(new Date().toISOString(), locale),
    letter.to,
    '',
    fillText(letter.body, {
      licensee: license.licenseeName,
      item: license.itemTitle,
      creator: license.creatorName,
      code: license.code,
      date: formatDate(license.issuedAt, locale),
      project: license.projectName,
    }),
    '',
    channels.length ? fillText(letter.channels, { channels: channels.map((channel) => channel.url).join(', ') }) : letter.noChannels,
    fillText(letter.check, { link: appUrl(licenseCheckPath(license.code)) }),
    '',
    letter.closing,
  ].join('\n');
};
