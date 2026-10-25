import type {
  CopyrightRole,
  SupportTopic,
  SuspensionReason,
  AiAspectRatio,
  AiModelId,
  AiOperation,
  AiStyle,
  AiVideoModelId,
  AiVideoResolution,
  AiVoiceLanguage,
  AiVoiceType,
  AlertKind,
  BrokenDownloadReason,
  Governorate,
  LicenseUse,
  LicensingPreference,
  NotificationChannel,
  NotificationTopic,
  PaymentMethod,
  PlanDuration,
  RevokeReason,
  SavedPaymentKind,
  SocialProvider,
  UploadKind,
  UseCase,
} from '@/shared/constants';
import type { Locale } from '@/shared/theme';
import type { CategoryId } from './catalog';

// ---------- Plans ----------

export type PlanId = 'individual' | 'ultimate' | 'teams' | 'enterprise';

// Ultimate lets the subscriber pick how many AI credits a month they get, for an extra monthly price.
export interface CreditTier {
  credits: number;
  extraMonthlyPrice: number; // EGP, on top of the plan's price
}

export interface Plan {
  id: PlanId;
  monthlyPrice: number | null; // EGP a month incl. VAT (per seat on Teams); null: price on request (Enterprise)
  perMember: boolean;
  minMembers: number;
  featured: boolean; // highlighted as the most popular
  downloadsPerMonth: number | null; // per seat on Teams; null: unlimited
  credits: number; // AI credits a month (per seat on Teams); Ultimate: the smallest tier
  creditTiers: CreditTier[]; // empty when the credits are fixed
  concurrentGenerations: number; // AI generations that can run at the same time
  models: AiModelId[]; // AI image models the plan includes
  videoModels: AiVideoModelId[]; // AI video models the plan includes
  studentPrice: boolean; // verified students get the student discount
  active?: boolean; // false: no longer sold (hidden on the pricing page); current subscribers keep it
}

// A promo code: a share off the first payment, set up by the admin team.
export interface PromoCode {
  id: string;
  code: string; // upper case
  percent: number; // off the first payment, 1 to 100
  planIds: PlanId[]; // the plans it works for; empty: every plan and project pass
  expiresAt: string; // YYYY-MM-DD, the last day it works
  maxUses: number | null; // null: no limit
  uses: number;
  active: boolean; // false: turned off by the team
}

export type PassId = 'week' | 'downloads10';

// A short project pass: a few days of downloads, or a set number of downloads.
export interface ProjectPass {
  id: PassId;
  price: number; // EGP incl. VAT
  days: number; // valid for
  downloads: number; // downloads included
}

// ---------- The user ----------

// What the user tells us after signing up ("Gather user information"); editable in the account settings.
export interface UserProfile {
  fullName: string;
  arabicName?: string; // shown on license certificates and invoices
  phone: string; // Egyptian mobile number, national format: 01XXXXXXXXX
  useCase: UseCase;
  interests: CategoryId[];
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

// A verified university email: the user gets the student price.
export interface StudentStatus {
  email: string;
  verifiedAt: string; // ISO date
}

// A payment method saved to the account. Only a masked summary is kept, never the full card number.
export interface SavedPaymentMethod {
  id: string;
  kind: SavedPaymentKind;
  summary: string; // "•••• 4242", "010 1234 5678", "name@instapay"
  holder?: string; // cards
  expiry?: string; // cards: "MM/YY"
  isDefault: boolean;
  addedAt: string; // ISO date
}

// One line on an invoice. Amounts include VAT.
export type InvoiceLine =
  | { kind: 'plan'; planId: PlanId; duration: PlanDuration; members: number; credits?: number; amount: number }
  | { kind: 'pass'; passId: PassId; amount: number }
  | { kind: 'seats'; planId: PlanId; members: number; amount: number } // seats added mid-period
  | { kind: 'proration'; fromPlanId: PlanId; toPlanId: PlanId; amount: number } // plan changed mid-period (negative: credit)
  | { kind: 'discount'; code: string; amount: number } // promo code (negative)
  | { kind: 'balance'; amount: number }; // account credit used (negative)

export type InvoiceStatus = 'paid' | 'pending' | 'failed';

// An e-invoice: every payment gets one, submitted to the tax authority.
export interface Invoice {
  id: string;
  number: string; // "INV-2026-000123"
  issuedAt: string; // ISO date
  lines: InvoiceLine[];
  total: number; // EGP incl. VAT
  vat: number; // the VAT included in the total
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  taxUuid: string; // the tax authority's id for the e-invoice
  buyerName: string;
  buyerArabicName?: string;
  billingAddress: BillingAddress | null;
  refunded?: number; // EGP the team refunded to the payment method
  taxDocuments?: TaxDocument[]; // e-invoices or e-receipts the team sent for this payment (Admin › Invoices)
}

// An e-invoice (company, with a tax ID) or e-receipt (person) sent to the tax authority. Demo: not really sent.
export interface TaxDocument {
  id: string;
  number: string; // e.g. EINV-2026-00042
  kind: 'invoice' | 'receipt';
  transactionId: string;
  customerName: string;
  taxId?: string; // the company's tax registration number, for e-invoices
  amount: number; // EGP, before VAT
  vat: number; // EGP
  issuedAt: string;
  status: 'accepted' | 'rejected';
  etaUuid?: string; // given by the tax authority when accepted
  rejectReason?: 'taxIdNotRegistered'; // the tax authority's reason; the admin page shows it in words
}

// One download. It's "preparing" for a moment after it's requested, then "ready".
export interface Download {
  id: string;
  itemId: string;
  itemTitle: string; // the item's original title
  projectName: string;
  use: LicenseUse;
  licenseCode: string;
  requestedAt: string; // ISO date
  // Doesn't count against the plan's limit. `answer` is the support team's (Admin › Support › Item reports).
  reportedBroken?: { reason: BrokenDownloadReason; at: string; answer?: 'fixed' | 'removed' | 'dismissed' };
}

export interface YoutubeChannel {
  id: string;
  url: string;
  name: string; // "@handle" or the channel's id, shown in lists and on proof-of-license letters
  addedAt: string; // ISO date
}

// One of the user's own files in a collection (the file itself is kept in the browser's file store).
export interface UploadRef {
  id: string;
  name: string;
  kind: UploadKind;
  mime: string;
  size: number; // bytes
  addedAt: string; // ISO date
}

export interface UserCollection {
  id: string;
  name: string;
  parentId: string | null; // nested collections
  pinned: boolean; // shown first when saving an item
  shareId: string | null; // anyone with the share link can view it while this is set
  itemIds: string[]; // newest first
  uploads: UploadRef[];
  createdAt: string; // ISO date
}

// Something the user should know about, shown in Notifications.
export interface Alert {
  id: string;
  kind: AlertKind;
  params: Record<string, string>; // filled into the alert's text (item title, reason, date…)
  link?: string; // app path the alert opens
  createdAt: string; // ISO date
  read: boolean;
}

// What a generation asked for. Each tool uses the fields it needs.
export interface AiRequest {
  tool: AiOperation;
  prompt: string; // the description, the edit to make, or the text to read out
  model?: AiModelId | AiVideoModelId;
  count?: number; // images
  aspect?: AiAspectRatio;
  style?: AiStyle;
  burst?: boolean; // several variations of one image for one credit
  kind?: string; // graphic or mockup kind, edit mode, relight direction
  tint?: string; // the main color of a reference image, which guides the result (a hex color from the user's file)
  sourceName?: string; // the image or upload the tool worked on
  duration?: number; // seconds of video or music
  resolution?: AiVideoResolution;
  audio?: boolean; // video with sound
  language?: AiVoiceLanguage;
  voice?: AiVoiceType;
}

// One result: drawn from the request (images), or a file kept in the browser (edited images, video, audio).
export interface GenerationOutput {
  kind: 'image' | 'video' | 'audio' | 'speech'; // speech: read out by the browser's voices
  fileId?: string;
  mime?: string;
}

export interface Generation extends AiRequest {
  id: string;
  credits: number; // spent
  createdAt: string; // ISO date; when it starts and finishes follows from the queue (see utils/ai)
  seed: number;
  outputs: GenerationOutput[];
  licenseCode?: string; // the license for what was generated
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
  favoriteIds: string[]; // newest first
  collections: UserCollection[];
  following: string[]; // creator ids
  youtubeChannels: YoutubeChannel[];
  alerts: Alert[]; // newest first
  student: StudentStatus | null;
  paymentMethods: SavedPaymentMethod[];
  invoices: Invoice[]; // newest first
  balance: number; // EGP credit from a downgrade, used on the next payment
  generations: Generation[]; // newest first
  supportRequests: SupportRequest[]; // newest first
  copyrightReports: CopyrightReport[]; // newest first
  suspension: Suspension | null; // a suspended account can't download or generate until it's lifted
}

// ---------- Support ----------

export interface SupportRequest {
  id: string;
  reference: string; // "SUP-482913"
  topic: SupportTopic;
  subject: string;
  message: string;
  createdAt: string; // ISO date
  status: 'open' | 'answered' | 'closed';
  replies?: SupportReply[]; // from the support team, oldest first
}

export interface SupportReply {
  message: string;
  by: string; // the team member's name
  at: string; // ISO date
}

export interface CopyrightReport {
  id: string;
  reference: string; // "CR-104822"
  itemId: string;
  itemTitle: string;
  name: string;
  email: string;
  role: CopyrightRole;
  details: string;
  createdAt: string; // ISO date
  // The licensing team's decision (Admin › Licenses › Copyright claims).
  decision?: { status: 'investigating' | 'takenDown' | 'rejected'; note?: string };
}

export interface Suspension {
  reason: SuspensionReason;
  at: string; // ISO date
  banned?: boolean; // closed for good by an admin, not just suspended
  appeal: { message: string; at: string; rejectedAt?: string } | null; // under review once sent, until an admin rejects it
}

// ---------- Subscriptions ----------

export type SubscriptionStatus = 'active' | 'pendingPayment';

export interface Subscription {
  planId: PlanId;
  duration: PlanDuration;
  members: number; // seats on Teams, 1 otherwise
  credits: number; // AI credits a month (all seats together on Teams)
  paymentMethod: PaymentMethod;
  savedMethodId?: string; // the saved method renewals and changes are charged to
  autoRenew: boolean; // only possible with a card
  total: number; // EGP a period at the plan's price (what a renewal costs)
  paid?: number; // EGP actually paid for the current period (after a promo code or account credit); unused time is credited from this
  status: SubscriptionStatus;
  startedAt: string; // ISO date: start of the current period
  endsAt: string; // ISO date: end of the current period
  canceledAt?: string; // canceled: access continues until endsAt, then it ends instead of renewing
  fawryCode?: string; // reference code to pay at Fawry while the payment is pending
  payBy?: string; // ISO date: the Fawry code expires after this
}

// A project pass bought instead of (or as well as) a plan.
export interface PassPurchase {
  passId: PassId;
  startedAt: string; // ISO date
  endsAt: string; // ISO date
  downloads: number; // included
}

// ---------- Teams ----------

// The owner pays for the team and manages admins; admins invite and remove members.
export type TeamRole = 'owner' | 'admin' | 'member';
export type InviteRole = Exclude<TeamRole, 'owner'>;

export interface TeamMember {
  accountId: string;
  name: string;
  email: string;
  role: TeamRole;
  joinedAt: string; // ISO date
}

export interface TeamInvite {
  id: string;
  email: string;
  role: InviteRole;
  invitedAt: string; // ISO date
  invitedBy: string; // the inviter's name
}

// A Teams or Enterprise plan's people and shared collections. The plan itself is the owner's subscription.
export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[]; // the owner first
  invites: TeamInvite[]; // waiting for an answer; each holds a seat
  collections: UserCollection[]; // shared: every member can view and add to them
}

// The team as one member sees it: their role, the seats, and what the whole team has used this month.
export interface TeamSession extends Team {
  role: TeamRole;
  ownerName: string;
  seats: number;
  usesTeamPlan: boolean; // this member downloads and generates with the team's plan
  downloads: Download[]; // every member's downloads (the team's plan limit counts them together)
  generations: Generation[]; // every member's AI generations (the team shares its credits)
}

// An invitation to someone's team, shown to the invited user.
export interface TeamInvitation {
  teamId: string;
  teamName: string;
  inviteId: string;
  role: InviteRole;
  invitedBy: string;
}

export type Session =
  | { status: 'guest' }
  | {
      status: 'signedIn';
      user: User;
      subscription: Subscription | null; // the user's own plan, or their team's when they don't have one
      pass: PassPurchase | null;
      team: TeamSession | null;
      invitations: TeamInvitation[];
    };

// ---------- Licenses ----------

export interface License {
  code: string;
  itemId: string;
  itemTitle: string;
  creatorName: string;
  licenseeName: string;
  projectName: string;
  use: LicenseUse;
  issuedAt: string; // ISO date
}

// A license as the license server keeps it: who owns it and whether it is still valid.
export interface LicenseRecord extends License {
  ownerId: string;
  teamId?: string; // issued on a team plan: every member of the team can use it
  revoked?: { reason: RevokeReason; at: string; note?: string }; // note: what the team wrote down (not shown to the customer)
  itemRemoved?: string; // ISO date the item left the library (the license stays valid)
}
