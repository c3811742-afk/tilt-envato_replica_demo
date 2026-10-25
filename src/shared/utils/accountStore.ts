import {
  accountPath,
  auth,
  defaultLicensingPreference,
  itemPath,
  licenseCheckPath,
  notificationTopics,
  renewalReminderDays,
  routes,
  storageKeys,
  type AlertKind,
  type RevokeReason,
} from '@/shared/constants';
import { mockLicenses } from '@/shared/mocks';
import type { Locale } from '@/shared/theme';
import type {
  Alert,
  Team,
  TeamInvitation,
  TeamSession,
  LicenseRecord,
  LicensingSettings,
  NotificationSettings,
  PassPurchase,
  PlanId,
  Subscription,
  User,
  UserProfile,
} from '@/shared/types';
import { ApiError } from './apiError';
import { respond, respondError } from './mockResponse';
import { findPlanById } from './siteSettings';
import { storage } from './storage';

// The demo's mock server: accounts, licenses and catalog events live in this browser's storage; nothing is sent anywhere.
// Every API module (auth, billing, library, AI, demo) reads and writes through here.

export type CodePurpose = 'verifyEmail' | 'verifyPhone' | 'resetPassword' | 'verifyStudent';

export interface StoredAccount extends User {
  passwordHash: string | null; // null for accounts that only sign in with Google, Apple or Facebook
  pendingCode: { code: string; purpose: CodePurpose; expiresAt: string; target?: string } | null;
  subscription: Subscription | null;
  pass: PassPurchase | null;
}

export interface SessionAccount {
  user: User;
  subscription: Subscription | null; // the user's own plan, or their team's when they don't have one
  pass: PassPurchase | null;
  team: TeamSession | null;
  invitations: TeamInvitation[];
}

const defaultNotifications = (language: Locale): NotificationSettings => ({
  channels: { email: true, whatsapp: false },
  topics: Object.fromEntries(notificationTopics.map((topic) => [topic, true])) as NotificationSettings['topics'],
  language,
});

const defaultLicensing: LicensingSettings = { preference: defaultLicensingPreference, defaultProjectName: '' };

// Fields every account has, with nothing in them yet.
const emptyAccountFields = {
  phoneVerified: false,
  licensing: defaultLicensing,
  billingAddress: null,
  tourCompletedAt: null,
  releasesSeenAt: null,
  downloads: [],
  favoriteIds: [],
  collections: [],
  following: [],
  youtubeChannels: [],
  alerts: [],
  student: null,
  paymentMethods: [],
  invoices: [],
  balance: 0,
  generations: [],
  supportRequests: [],
  copyrightReports: [],
  suspension: null,
  pendingCode: null,
  subscription: null,
  pass: null,
} satisfies Partial<StoredAccount>;

// Plans an older version of the demo sold, and what they became.
const renamedPlans: Record<string, PlanId> = { student: 'individual', team: 'teams' };

type LegacyAccount = Partial<StoredAccount> & {
  provider?: string;
  savedItemIds?: string[];
  profile?: (UserProfile & { role?: string; studentId?: string }) | null;
  subscription?: (Omit<Subscription, 'planId' | 'duration' | 'credits'> & { planId: string; duration: number; credits?: number }) | null;
};

// Accounts saved by an older version of the demo get the fields added since, so they keep working.
const upgrade = (saved: LegacyAccount): StoredAccount => {
  const legacyProvider = saved.provider && saved.provider !== 'email' ? saved.provider : null;
  const profile = saved.profile ? { ...saved.profile, useCase: saved.profile.useCase ?? 'freelancer' } : null;
  const subscription = saved.subscription
    ? {
        ...saved.subscription,
        planId: (renamedPlans[saved.subscription.planId] ?? saved.subscription.planId) as PlanId,
        duration: saved.subscription.duration === 1 ? 1 : 12,
        credits: saved.subscription.credits ?? 0,
      }
    : null;
  return {
    ...emptyAccountFields,
    hasPassword: Boolean(saved.passwordHash),
    linkedProviders: legacyProvider ? [legacyProvider] : [],
    notifications: defaultNotifications('ar'),
    favoriteIds: saved.savedItemIds ?? [],
    ...saved,
    profile,
    subscription,
    downloads: (saved.downloads ?? []).map((download) => ({ ...download, use: download.use ?? 'other' })),
    // Generations from before AI Studio were all images drawn from the request.
    generations: (saved.generations ?? []).map((generation) => ({ ...generation, tool: generation.tool ?? 'image', outputs: generation.outputs ?? Array.from({ length: generation.count ?? 1 }, () => ({ kind: 'image' as const })) })),
  } as StoredAccount;
};

export const readAccounts = (): StoredAccount[] => {
  const saved = storage.get(storageKeys.accounts);
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(upgrade) : [];
  } catch (error) {
    // Corrupted demo data: start with no accounts rather than breaking the app.
    console.error(error);
    return [];
  }
};

export const writeAccounts = (accounts: StoredAccount[]) => storage.set(storageKeys.accounts, JSON.stringify(accounts));

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const findByEmail = (email: string) => readAccounts().find((account) => account.email === normalizeEmail(email));
export const findById = (id: string) => readAccounts().find((account) => account.id === id);

export const saveAccount = (updated: StoredAccount) => {
  writeAccounts([...readAccounts().filter((account) => account.id !== updated.id), updated]);
  return updated;
};

// What the signed-in user sees: their account, the plan they use (their own, or their team's), their team and invitations.
export const toSessionAccount = (account: StoredAccount): SessionAccount => {
  const { passwordHash: _hash, pendingCode: _code, subscription: _subscription, pass, ...user } = account;
  const access = planAccess(account);
  const team = teamOf(account.id);
  return {
    user,
    subscription: access.subscription,
    pass,
    team: team && teamSession(team, account.id, access.pool, access.viaTeam),
    invitations: invitationsFor(account),
  };
};

export const startSession = (account: StoredAccount) => {
  storage.set(storageKeys.sessionUserId, account.id);
  return toSessionAccount(account);
};

// Passwords are only ever stored as a SHA-256 hash, even in the demo.
export const hashPassword = async (password: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const randomDigits = (length: number) =>
  [...crypto.getRandomValues(new Uint8Array(length))].map((byte) => byte % 10).join('');

export const minutesFromNow = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

// A period of `months` months (or `days` days) starting at `start`.
export const periodFrom = (start: Date, months: number, days = 0) => {
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  end.setDate(end.getDate() + days);
  return { startedAt: start.toISOString(), endsAt: end.toISOString() };
};

// Creates a new one-time code on the account (the demo shows it instead of sending it).
export const issueCode = (account: StoredAccount, purpose: CodePurpose, target?: string) => {
  const code = randomDigits(auth.codeLength);
  return saveAccount({ ...account, pendingCode: { code, purpose, target, expiresAt: minutesFromNow(auth.codeValidMinutes) } });
};

export const checkCode = (account: StoredAccount, purpose: CodePurpose, code: string) => {
  const pending = account.pendingCode;
  if (!pending || pending.purpose !== purpose || pending.code !== code.trim()) throw new ApiError('invalidCode');
  if (new Date(pending.expiresAt) < new Date()) throw new ApiError('codeExpired');
  return pending;
};

export const signedInAccountOrNull = () => {
  const id = storage.get(storageKeys.sessionUserId);
  return (id ? findById(id) : undefined) ?? null;
};

export const signedInAccount = () => {
  const account = signedInAccountOrNull();
  if (!account) throw new ApiError('notSignedIn');
  return account;
};

// Saves changes to the signed-in account and returns it for the session.
export const updateSignedIn = (changes: (account: StoredAccount) => Partial<StoredAccount>) => {
  const account = signedInAccount();
  return toSessionAccount(saveAccount({ ...account, ...changes(account) }));
};

// A new account with nothing set up yet.
export const newAccount = (
  fields: Pick<StoredAccount, 'name' | 'email' | 'emailVerified' | 'passwordHash' | 'linkedProviders'>,
  language: Locale,
): StoredAccount => ({
  ...emptyAccountFields,
  id: crypto.randomUUID(),
  hasPassword: Boolean(fields.passwordHash),
  termsAcceptedAt: new Date().toISOString(),
  profile: null,
  notifications: defaultNotifications(language),
  ...fields,
});

// Runs a mock server call: its result after the usual delay, or its ApiError as a failed request.
export const call = async <T>(handler: () => T | Promise<T>): Promise<T> => {
  try {
    return await respond(await handler());
  } catch (error) {
    return respondError(error instanceof Error ? error : new Error(String(error)));
  }
};

// A notification for the account (renewal reminder, payment failed, item removed…), newest first.
export const withAlert = (account: StoredAccount, kind: AlertKind, params: Alert['params'], link?: string): StoredAccount => ({
  ...account,
  alerts: [{ id: crypto.randomUUID(), kind, params, link, createdAt: new Date().toISOString(), read: false }, ...account.alerts],
});

const dayMs = 24 * 60 * 60 * 1000;

// Adds a reminder when a plan's period ends within the reminder window (once per end date): it renews on that day,
// or, when it won't renew (auto-renew off or canceled), it ends then and can be renewed before it does.
export const withDueReminders = (account: StoredAccount, now: Date = new Date()): StoredAccount => {
  const subscription = account.subscription;
  if (!subscription || subscription.status !== 'active') return account;
  const renews = subscription.autoRenew && !subscription.canceledAt;
  const kind = renews ? 'renewalReminder' : 'planEnding';
  const daysLeft = (new Date(subscription.endsAt).getTime() - now.getTime()) / dayMs;
  const alreadySent = account.alerts.some((alert) => alert.kind === kind && alert.params.date === subscription.endsAt);
  if (daysLeft < 0 || daysLeft > renewalReminderDays || alreadySent) return account;
  return withAlert(account, kind, { plan: subscription.planId, date: subscription.endsAt, total: String(subscription.total) }, accountPath('plan'));
};

// ---------- License server ----------

export const readLicenses = (): LicenseRecord[] => {
  const saved = storage.get(storageKeys.licenses);
  if (!saved) return mockLicenses;
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as LicenseRecord[]) : mockLicenses;
  } catch (error) {
    console.error(error);
    return mockLicenses;
  }
};

export const writeLicenses = (licenses: LicenseRecord[]) => storage.set(storageKeys.licenses, JSON.stringify(licenses));

// Revokes a license and tells its owner (the license check then shows it as revoked, with the reason).
// Returns the updated license, or null when no license has that code.
export const revokeLicenseRecord = (code: string, reason: RevokeReason, note?: string): LicenseRecord | null => {
  const licenses = readLicenses();
  const license = licenses.find((current) => current.code === code);
  if (!license) return null;
  const revoked: LicenseRecord = { ...license, revoked: { reason, at: new Date().toISOString(), note } };
  writeLicenses(licenses.map((current) => (current.code === code ? revoked : current)));
  const owner = findById(license.ownerId);
  if (owner) saveAccount(withAlert(owner, 'licenseRevoked', { title: license.itemTitle, code, reason }, licenseCheckPath(code)));
  return revoked;
};

// ---------- Catalog events (demo) ----------

export interface CatalogEvents {
  removedItemIds: Record<string, string>; // item id -> ISO date it left the library
  publishedAt: Record<string, string>; // item id -> ISO date a creator published it (shown as new)
}

export const readCatalogEvents = (): CatalogEvents => {
  const empty: CatalogEvents = { removedItemIds: {}, publishedAt: {} };
  const saved = storage.get(storageKeys.catalogEvents);
  if (!saved) return empty;
  try {
    return { ...empty, ...(JSON.parse(saved) as Partial<CatalogEvents>) };
  } catch (error) {
    console.error(error);
    return empty;
  }
};

export const writeCatalogEvents = (events: CatalogEvents) => storage.set(storageKeys.catalogEvents, JSON.stringify(events));

// An item left the library (the team removed it, or a creator's element was taken down, turned off or deleted).
// Everyone who downloaded it is told, and their license stays valid: Downloads and the license check say it was removed.
export const recordItemRemoved = (itemId: string, title: string) => {
  const events = readCatalogEvents();
  if (events.removedItemIds[itemId]) return;
  writeCatalogEvents({ ...events, removedItemIds: { ...events.removedItemIds, [itemId]: new Date().toISOString() } });
  writeAccounts(
    readAccounts().map((account) =>
      account.downloads.some((download) => download.itemId === itemId) ? withAlert(account, 'itemRemoved', { title }, routes.downloads) : account,
    ),
  );
};

// A creator published something new: everyone who follows them is told, with a link to it.
export const notifyFollowers = (creatorId: string, creatorName: string, itemId: string, title: string) =>
  writeAccounts(
    readAccounts().map((account) =>
      account.following.includes(creatorId) ? withAlert(account, 'creatorPublished', { creator: creatorName, title }, itemPath(itemId)) : account,
    ),
  );

// An item is back in the library (a creator's element turned on again or republished after an appeal).
export const recordItemRestored = (itemId: string) => {
  const events = readCatalogEvents();
  if (!events.removedItemIds[itemId]) return;
  const { [itemId]: _restored, ...removedItemIds } = events.removedItemIds;
  writeCatalogEvents({ ...events, removedItemIds });
};

// ---------- Teams ----------

export const readTeams = (): Team[] => {
  const saved = storage.get(storageKeys.teams);
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as Team[]) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const writeTeams = (teams: Team[]) => storage.set(storageKeys.teams, JSON.stringify(teams));

export const saveTeam = (updated: Team) => {
  writeTeams([...readTeams().filter((team) => team.id !== updated.id), updated]);
  return updated;
};

// The team an account belongs to (as owner, admin or member).
export const teamOf = (accountId: string) => readTeams().find((team) => team.members.some((member) => member.accountId === accountId)) ?? null;

// Plans that come with a team: priced per seat.
const isTeamPlan = (subscription: Subscription | null) => subscription !== null && Boolean(subscription && findPlanById(subscription.planId)?.perMember);

// The plan an account downloads and generates with, and whose usage counts against it:
// their own plan, or (for team members without one) the owner's, shared by the whole team.
export const planAccess = (account: StoredAccount): { subscription: Subscription | null; pool: StoredAccount[]; viaTeam: boolean } => {
  const team = teamOf(account.id);
  const owner = team && (team.ownerId === account.id ? account : findById(team.ownerId));
  const teamPlan = owner && isTeamPlan(owner.subscription) && owner.subscription?.status === 'active' ? owner.subscription : null;
  const usesTeam = teamPlan && (team?.ownerId === account.id || !account.subscription || account.subscription.status !== 'active');
  if (!team || !usesTeam) return { subscription: account.subscription, pool: [account], viaTeam: false };
  const members = team.members.map((member) => (member.accountId === account.id ? account : findById(member.accountId))).filter((member): member is StoredAccount => member !== undefined);
  return { subscription: teamPlan, pool: members, viaTeam: true };
};

const teamSession = (team: Team, accountId: string, pool: StoredAccount[], usesTeamPlan: boolean): TeamSession => {
  const owner = findById(team.ownerId);
  return {
    ...team,
    role: team.members.find((member) => member.accountId === accountId)?.role ?? 'member',
    ownerName: owner?.name ?? '',
    seats: owner?.subscription && isTeamPlan(owner.subscription) ? owner.subscription.members : team.members.length,
    usesTeamPlan,
    downloads: pool.flatMap((member) => member.downloads).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    generations: pool.flatMap((member) => member.generations).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
};

// Invitations waiting for this account's email address.
const invitationsFor = (account: StoredAccount): TeamInvitation[] =>
  readTeams().flatMap((team) =>
    team.invites
      .filter((invite) => invite.email === account.email && !team.members.some((member) => member.accountId === account.id))
      .map((invite) => ({ teamId: team.id, teamName: team.name, inviteId: invite.id, role: invite.role, invitedBy: invite.invitedBy })),
  );
