export type LicenseStatus = 'valid' | 'revoked';
import type { RevokeReason } from '@/shared/constants';

// The same reasons the customer sees on the license check page.
export type { RevokeReason };

// The license a customer gets for one project when downloading an element.
export interface License {
  id: string;
  code: string; // e.g. TILT-7K2M-94QX, printed on the license certificate
  element: { id: string; title: string };
  customer: { name: string; email: string };
  project: string;
  issuedAt: string;
  status: LicenseStatus;
  revoke?: { reason: RevokeReason; note: string; at: string };
  source: 'demo' | 'site'; // site: issued on the customer side in this browser (the license server)
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
  reference?: string; // what the reporter was given, e.g. CR-104822 (site reports)
  source?: 'demo' | 'site'; // site: sent with the copyright report form on an item page
}

// A creator's appeal against a copyright takedown of their element (one per takedown).
export type ElementAppealStatus = 'open' | 'accepted' | 'rejected';

export interface ElementAppeal {
  id: string; // the element's id
  element: { id: string; title: string };
  creator: { id: string; name: string };
  claimReference?: string; // the claim that led to the takedown, e.g. CR-104822
  takedownNote: string;
  message: string;
  receivedAt: string;
  status: ElementAppealStatus;
  decisionNote?: string;
}
