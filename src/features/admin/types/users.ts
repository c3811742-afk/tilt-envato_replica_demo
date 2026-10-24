import type { Generation } from '@/shared/types';
import type { PartnerProgram, SuspensionReason } from '@/shared/constants';
import type { Subscription } from './billing';
import type { LicenseStatus } from './licensing';

export type UserKind = 'customer' | 'creator';
export type AccountStatus = 'active' | 'suspended' | 'banned';

// demo: one of the admin demo accounts. site: an account someone signed up for on the customer side in this browser,
// so suspending it really locks them out there, and their appeal comes back here.
export type AccountSource = 'demo' | 'site';

export interface Appeal {
  message: string;
  at: string;
  rejectedAt?: string; // no date: waiting for an admin
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  kind: UserKind;
  source: AccountSource;
  joinedAt: string;
  status: AccountStatus;
  statusReason?: SuspensionReason; // why it's suspended or banned
  statusAt?: string;
  appeal?: Appeal;
  planName?: string; // the plan they pay for now, if any
}

export interface UserDownload {
  id: string;
  itemTitle: string;
  licenseCode: string;
  at: string;
}

export interface UserLicense {
  code: string;
  itemTitle: string;
  project: string;
  issuedAt: string;
  status: LicenseStatus;
}

// Everything the user page shows about one account.
export interface UserDetails {
  account: UserAccount;
  subscriptions: Subscription[];
  downloads: UserDownload[]; // newest first
  licenses: UserLicense[]; // newest first
  generations: Generation[]; // AI Studio, newest first (site accounts)
  credits: { used: number; total: number } | null; // this month's AI credits, when the plan includes them
}

export type StatusAction = 'suspend' | 'ban' | 'reactivate';

export interface StatusInput {
  action: StatusAction;
  reason?: SuspensionReason; // required to suspend or ban
  note: string;
}

export type AppealOutcome = 'accepted' | 'rejected';

// An account that downloaded far more than usual in the last day: possible account sharing or scraping.
export interface DownloadAlert {
  user: Pick<UserAccount, 'id' | 'name' | 'email' | 'status'>;
  count: number; // downloads in the window
  usual: number; // a normal day for this account
  since: string; // start of the window
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type ApplicationRejectReason = 'portfolioQuality' | 'notOriginal' | 'incomplete' | 'other';

// Who applied for what: to sell as an author, or to join a partner program (from the site's programs pages).
export type ApplicationProgram = 'author' | PartnerProgram;

// Someone asking to sell on TILT as a creator, or to join a partner program.
export interface CreatorApplication {
  id: string; // the reference they were given, e.g. APP-482913
  program: ApplicationProgram;
  name: string;
  email: string;
  portfolio: string; // a link: their portfolio, or their website for partners
  message?: string; // partners: what they'd like to do
  categories: string[];
  at: string;
  source: AccountSource;
  status: ApplicationStatus;
  decision?: { reason?: ApplicationRejectReason; note: string; adminName: string; at: string };
}

export type IdDocument = 'nationalId' | 'passport';
export type IdRejectReason = 'unreadable' | 'nameMismatch' | 'expired' | 'other';

// A creator's identity check, needed before their first payout.
export interface IdentityCheck {
  id: string;
  creator: { id: string; name: string; email: string };
  document: IdDocument;
  nameOnDocument: string;
  numberEnding: string; // last digits only; the full number is never shown
  expiresAt: string;
  submittedAt: string;
  status: ApplicationStatus;
  decision?: { reason?: IdRejectReason; note: string; adminName: string; at: string };
}

export interface DecisionInput<R extends string> {
  approve: boolean;
  reason?: R; // required to reject
  note: string;
}

// Things waiting for an admin, counted for the top bar and the sidebar.
export interface AdminAlerts {
  reviews: number;
  appeals: number;
  downloadAlerts: number;
  applications: number;
  identityChecks: number;
  tickets: number;
}

export type AdminAlertKey = keyof AdminAlerts;
