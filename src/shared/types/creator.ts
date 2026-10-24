import type { CategoryId } from './catalog';

export type IdType = 'nationalId' | 'passport';
export type PayoutMethod = 'bankTransfer' | 'instapay' | 'vodafoneCash';
export type TaxStatus = 'individual' | 'business';

// A file the user picked. Only its details are kept; the demo doesn't upload it.
export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

// Everything a user fills in to become a creator.
export interface CreatorApplication {
  // Application
  specialties: CategoryId[];
  portfolioUrl: string;
  samples: FileInfo | null;
  about: string;
  // Agreement
  acceptAgreement: boolean;
  confirmOwnership: boolean;
  // Identity
  idType: IdType;
  legalName: string;
  idNumber: string;
  idFront: FileInfo | null;
  idBack: FileInfo | null;
  // Payout and tax
  payoutMethod: PayoutMethod;
  bankName: string;
  accountHolder: string;
  iban: string;
  instapayAddress: string;
  walletNumber: string;
  taxStatus: TaxStatus;
  taxNumber: string;
  // Public profile
  displayName: string;
  username: string;
  bio: string;
  avatar: FileInfo | null;
}

export interface CreatorApplicationReceipt {
  id: string;
  submittedAt: string; // ISO date
}
