export type LicenseStatus = 'valid' | 'revoked';
export type RevokeReason = 'fraud' | 'chargeback' | 'stolenAccount' | 'termsBreach';

// The license a customer gets for one project when downloading an element.
export interface License {
  id: string;
  code: string; // e.g. TILT-7K2M-94QX, printed on the license certificate
  element: { id: string; title: string };
  customer: { name: string; email: string };
  project: string;
  issuedAt: string;
  status: LicenseStatus;
  revoke?: { reason: RevokeReason; note: string; adminId: string; at: string };
}

export interface RevokeInput {
  reason: RevokeReason;
  note: string;
}

export type ClaimStatus = 'new' | 'investigating' | 'takenDown' | 'rejected';
export type ClaimDecision = 'investigating' | 'takenDown' | 'rejected';

// A copyright (DMCA) claim: someone says a live element copies their work.
export interface CopyrightClaim {
  id: string;
  claimant: { name: string; email: string; company?: string };
  element: { id: string; title: string };
  originalLink: string;
  description: string;
  receivedAt: string;
  status: ClaimStatus;
  decisionNote?: string;
}
