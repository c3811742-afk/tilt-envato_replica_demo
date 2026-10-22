import type {
  Governorate,
  LicensingPreference,
  NotificationChannel,
  NotificationTopic,
  PaymentMethod,
  PlanDuration,
  SocialProvider,
  UseCase,
} from '@/shared/constants';
import type { Locale } from '@/shared/theme';
import type { CategoryId } from './catalog';

export type PlanId = 'student' | 'individual' | 'team';

export interface Plan {
  id: PlanId;
  monthlyPrice: number; // EGP per month (per member for the team plan), before duration discounts
  perMember: boolean;
  minMembers: number;
  featured: boolean; // highlighted as the most popular
}

// What the user tells us after signing up ("Gather user information"); editable in the account settings.
export interface UserProfile {
  fullName: string;
  arabicName?: string; // shown on license certificates and invoices
  phone: string; // Egyptian mobile number, national format: 01XXXXXXXXX
  useCase: UseCase;
  interests: CategoryId[];
  studentId?: string; // SYNC student ID, needed for the Student plan
}

export interface NotificationSettings {
  channels: Record<NotificationChannel, boolean>;
  topics: Record<NotificationTopic, boolean>;
  language: Locale; // emails and WhatsApp messages are written in this language
}

export interface LicensingSettings {
  preference: LicensingPreference;
  defaultProjectName: string; // used when the preference is "never ask"
  lastProjectName?: string; // suggested when the preference is "remember my last choice"
}

export interface BillingAddress {
  governorate: Governorate;
  city: string;
  street: string;
}

// One download in the queue. It's "preparing" for a moment after it's requested, then "ready".
export interface Download {
  id: string;
  itemId: string;
  itemTitle: string; // the item's original title
  projectName: string;
  licenseCode: string;
  requestedAt: string; // ISO date
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  hasPassword: boolean; // signs in with email and password
  linkedProviders: SocialProvider[]; // signs in with these too
  termsAcceptedAt: string; // ISO date: terms and privacy policy
  profile: UserProfile | null; // null until the user completes their profile
  notifications: NotificationSettings;
  licensing: LicensingSettings;
  billingAddress: BillingAddress | null;
  tourCompletedAt: string | null; // the first-login tour is shown until this is set
  releasesSeenAt: string | null; // release notes newer than this are unread
  downloads: Download[]; // newest first
  savedItemIds: string[]; // items the user saved to look at later, newest first
}

export type SubscriptionStatus = 'active' | 'pendingPayment';

export interface Subscription {
  planId: PlanId;
  duration: PlanDuration;
  members: number; // seats on the team plan, 1 otherwise
  paymentMethod: PaymentMethod;
  autoRenew: boolean; // only possible with a card
  total: number; // EGP paid for the whole period
  status: SubscriptionStatus;
  startedAt: string; // ISO date
  endsAt: string; // ISO date
  fawryCode?: string; // reference code to pay at Fawry while the payment is pending
  payBy?: string; // ISO date: the Fawry code expires after this
}

export type Session =
  | { status: 'guest' }
  | { status: 'signedIn'; user: User; subscription: Subscription | null };

export interface License {
  code: string;
  itemId: string;
  itemTitle: string;
  creatorName: string;
  licenseeName: string;
  projectName: string;
  issuedAt: string; // ISO date
}
