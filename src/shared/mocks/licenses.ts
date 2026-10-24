import type { LicenseRecord } from '@/shared/types';

// Licenses issued before this browser's demo started, so the license check has something to find.
export const mockLicenses: LicenseRecord[] = [
  {
    code: 'A7F3-2C9E-41B8-D605',
    itemId: 'ramadan-kareem-intro',
    itemTitle: 'Ramadan Kareem Intro',
    creatorName: 'Nile Motion',
    licenseeName: 'Mariam Adel',
    projectName: 'Ramadan campaign',
    use: 'socialMedia',
    issuedAt: '2026-09-30',
    ownerId: 'sample-owner',
  },
  {
    code: 'B2D8-7E14-90AC-3F51',
    itemId: 'oud-dreams',
    itemTitle: 'Oud Dreams',
    creatorName: 'Wekala Sounds',
    licenseeName: 'Karim Fathy',
    projectName: 'Travel vlog',
    use: 'youtube',
    issuedAt: '2026-08-14',
    ownerId: 'sample-owner',
    revoked: { reason: 'paymentReversed', at: '2026-09-02' },
  },
];
