import {
  auth,
  cardPaymentMethods,
  defaultLicensingPreference,
  fawry,
  notificationTopics,
  storageKeys,
  type PaymentMethod,
  type PlanDuration,
  type SocialProvider,
} from '@/shared/constants';
import { mockPlans } from '@/shared/mocks';
import type { Locale } from '@/shared/theme';
import type {
  BillingAddress,
  Download,
  Item,
  LicensingSettings,
  NotificationSettings,
  PlanId,
  Subscription,
  User,
  UserProfile,
} from '@/shared/types';
import { ApiError } from './apiError';
import { originalTitle } from './itemText';
import { respond, respondError } from './mockResponse';
import { getSubscriptionTotal } from './pricing';
import { nameFromEmail } from './session';
import { storage } from './storage';

// Mock account server for the demo: accounts live in this browser's storage, nothing is sent anywhere.

export type CodePurpose = 'verifyEmail' | 'verifyPhone' | 'resetPassword';

interface StoredAccount extends User {
  passwordHash: string | null; // null for accounts that only sign in with Google, Apple or Facebook
  pendingCode: { code: string; purpose: CodePurpose; expiresAt: string } | null;
  subscription: Subscription | null;
}

export interface SessionAccount {
  user: User;
  subscription: Subscription | null;
}

const defaultNotifications = (language: Locale): NotificationSettings => ({
  channels: { email: true, whatsapp: false },
  topics: Object.fromEntries(notificationTopics.map((topic) => [topic, true])) as NotificationSettings['topics'],
  language,
});

const defaultLicensing: LicensingSettings = { preference: defaultLicensingPreference, defaultProjectName: '' };

// Accounts saved by an older version of the demo get the fields added since, so they keep working.
const upgrade = (saved: Partial<StoredAccount> & { provider?: string; profile?: (UserProfile & { role?: string }) | null }) => {
  const legacyProvider = saved.provider && saved.provider !== 'email' ? (saved.provider as SocialProvider) : null;
  const profile = saved.profile ? { ...saved.profile, useCase: saved.profile.useCase ?? 'freelancer' } : null;
  return {
    phoneVerified: false,
    hasPassword: Boolean(saved.passwordHash),
    linkedProviders: legacyProvider ? [legacyProvider] : [],
    notifications: defaultNotifications('ar'),
    licensing: defaultLicensing,
    billingAddress: null,
    tourCompletedAt: null,
    releasesSeenAt: null,
    downloads: [],
    savedItemIds: [],
    ...saved,
    profile,
  } as StoredAccount;
};

const readAccounts = (): StoredAccount[] => {
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

const writeAccounts = (accounts: StoredAccount[]) => storage.set(storageKeys.accounts, JSON.stringify(accounts));

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const findByEmail = (email: string) => readAccounts().find((account) => account.email === normalizeEmail(email));
const findById = (id: string) => readAccounts().find((account) => account.id === id);

const saveAccount = (updated: StoredAccount) => {
  writeAccounts([...readAccounts().filter((account) => account.id !== updated.id), updated]);
  return updated;
};

const toSessionAccount = ({ passwordHash: _hash, pendingCode: _code, subscription, ...user }: StoredAccount): SessionAccount => ({
  user,
  subscription,
});

const startSession = (account: StoredAccount) => {
  storage.set(storageKeys.sessionUserId, account.id);
  return toSessionAccount(account);
};

// Passwords are only ever stored as a SHA-256 hash, even in the demo.
const hashPassword = async (password: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const randomDigits = (length: number) =>
  [...crypto.getRandomValues(new Uint8Array(length))].map((byte) => byte % 10).join('');

const minutesFromNow = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

// A plan period of `months` months starting at `start`.
const periodFrom = (start: Date, months: number) => {
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  return { startedAt: start.toISOString(), endsAt: end.toISOString() };
};

// Creates a new one-time code on the account (see demoCode: the demo shows it instead of sending it).
const issueCode = (account: StoredAccount, purpose: CodePurpose) => {
  const code = randomDigits(auth.codeLength);
  saveAccount({ ...account, pendingCode: { code, purpose, expiresAt: minutesFromNow(auth.codeValidMinutes) } });
};

const checkCode = (account: StoredAccount, purpose: CodePurpose, code: string) => {
  const pending = account.pendingCode;
  if (!pending || pending.purpose !== purpose || pending.code !== code.trim()) throw new ApiError('invalidCode');
  if (new Date(pending.expiresAt) < new Date()) throw new ApiError('codeExpired');
};

const signedInAccountOrNull = () => {
  const id = storage.get(storageKeys.sessionUserId);
  return (id ? findById(id) : undefined) ?? null;
};

const signedInAccount = () => {
  const account = signedInAccountOrNull();
  if (!account) throw new ApiError('notSignedIn');
  return account;
};

// Saves changes to the signed-in account and returns it for the session.
const updateSignedIn = (changes: (account: StoredAccount) => Partial<StoredAccount>) => {
  const account = signedInAccount();
  return toSessionAccount(saveAccount({ ...account, ...changes(account) }));
};

// A new account with nothing set up yet.
const newAccount = (fields: Pick<StoredAccount, 'name' | 'email' | 'emailVerified' | 'passwordHash' | 'linkedProviders'>, language: Locale): StoredAccount => ({
  id: crypto.randomUUID(),
  phoneVerified: false,
  hasPassword: Boolean(fields.passwordHash),
  termsAcceptedAt: new Date().toISOString(),
  profile: null,
  notifications: defaultNotifications(language),
  licensing: defaultLicensing,
  billingAddress: null,
  tourCompletedAt: null,
  releasesSeenAt: null,
  downloads: [],
  savedItemIds: [],
  pendingCode: null,
  subscription: null,
  ...fields,
});

// Runs a mock server call: its result after the usual delay, or its ApiError as a failed request.
const call = async <T>(handler: () => T | Promise<T>): Promise<T> => {
  try {
    return await respond(await handler());
  } catch (error) {
    return respondError(error instanceof Error ? error : new Error(String(error)));
  }
};

export interface SignUpRequest {
  email: string;
  password: string;
  language: Locale; // the site's language at sign-up; used for emails until the user changes it
}

export interface SocialRequest {
  provider: SocialProvider;
  email: string;
  name: string;
  intent: 'signUp' | 'signIn';
  language: Locale;
}

export interface SubscribeRequest {
  planId: PlanId;
  duration: PlanDuration;
  members: number;
  paymentMethod: PaymentMethod;
  autoRenew: boolean;
  studentId?: string;
  billingAddress: BillingAddress;
}

export interface DownloadRequest {
  item: Pick<Item, 'id' | 'title' | 'originalLanguage'>;
  projectName: string;
  licenseCode: string;
}

export const authApi = {
  // The signed-in account, read straight from storage (used when the app starts).
  currentAccount: (): SessionAccount | null => {
    const account = signedInAccountOrNull();
    return account ? toSessionAccount(account) : null;
  },

  // Demo only: the code that would have been emailed or texted, so the page can show it. A real server never exposes this.
  demoCode: (purpose: CodePurpose, email?: string): string | undefined => {
    const account = email ? findByEmail(email) : signedInAccountOrNull();
    const pending = account?.pendingCode;
    return pending?.purpose === purpose ? pending.code : undefined;
  },

  // Creates an email account, signs it in and sends the email verification code.
  signUp: ({ email, password, language }: SignUpRequest) =>
    call(async () => {
      if (findByEmail(email)) throw new ApiError('emailTaken');
      const account = saveAccount(
        newAccount(
          {
            name: nameFromEmail(normalizeEmail(email)),
            email: normalizeEmail(email),
            emailVerified: false,
            passwordHash: await hashPassword(password),
            linkedProviders: [],
          },
          language,
        ),
      );
      issueCode(account, 'verifyEmail');
      return startSession(account);
    }),

  signIn: ({ email, password }: Pick<SignUpRequest, 'email' | 'password'>) =>
    call(async () => {
      const account = findByEmail(email);
      if (account && !account.passwordHash) throw new ApiError('useSocialSignIn', { provider: account.linkedProviders[0] ?? '' });
      if (!account || account.passwordHash !== (await hashPassword(password))) throw new ApiError('invalidCredentials');
      return startSession(account);
    }),

  // Simulated Google / Apple / Facebook sign-in. Signing up with an existing account signs in and links the provider.
  continueWith: ({ provider, email, name, intent, language }: SocialRequest) =>
    call(() => {
      const existing = findByEmail(email);
      if (existing) {
        const linkedProviders = existing.linkedProviders.includes(provider)
          ? existing.linkedProviders
          : [...existing.linkedProviders, provider];
        return startSession(saveAccount({ ...existing, linkedProviders }));
      }
      if (intent === 'signIn') throw new ApiError('accountNotFound');
      return startSession(
        saveAccount(
          newAccount(
            {
              name: name.trim() || nameFromEmail(normalizeEmail(email)),
              email: normalizeEmail(email),
              emailVerified: true, // the provider has already confirmed the address
              passwordHash: null,
              linkedProviders: [provider],
            },
            language,
          ),
        ),
      );
    }),

  // Sends a new email or phone verification code to the signed-in user.
  resendCode: (purpose: Extract<CodePurpose, 'verifyEmail' | 'verifyPhone'>) =>
    call(() => {
      issueCode(signedInAccount(), purpose);
    }),

  verifyEmail: (code: string) =>
    call(() => {
      const account = signedInAccount();
      checkCode(account, 'verifyEmail', code);
      return toSessionAccount(saveAccount({ ...account, emailVerified: true, pendingCode: null }));
    }),

  verifyPhone: (code: string) =>
    call(() => {
      const account = signedInAccount();
      checkCode(account, 'verifyPhone', code);
      return toSessionAccount(saveAccount({ ...account, phoneVerified: true, pendingCode: null }));
    }),

  // Sends a password reset code.
  requestPasswordReset: (email: string) =>
    call(() => {
      const account = findByEmail(email);
      if (!account) throw new ApiError('accountNotFound');
      if (!account.passwordHash) throw new ApiError('useSocialSignIn', { provider: account.linkedProviders[0] ?? '' });
      issueCode(account, 'resetPassword');
    }),

  resetPassword: ({ email, code, password }: { email: string; code: string; password: string }) =>
    call(async () => {
      const account = findByEmail(email);
      if (!account) throw new ApiError('accountNotFound');
      checkCode(account, 'resetPassword', code);
      saveAccount({ ...account, passwordHash: await hashPassword(password), hasPassword: true, pendingCode: null });
    }),

  // Saves the profile and notification choices. A new or changed phone number has to be verified again.
  saveProfile: (profile: UserProfile, notifications?: NotificationSettings) =>
    call(() => {
      const account = signedInAccount();
      const phoneChanged = account.profile?.phone !== profile.phone;
      const saved = saveAccount({
        ...account,
        name: profile.fullName.trim(),
        profile,
        notifications: notifications ?? account.notifications,
        phoneVerified: account.phoneVerified && !phoneChanged,
      });
      if (phoneChanged) issueCode(saved, 'verifyPhone');
      return toSessionAccount(findById(saved.id) ?? saved);
    }),

  updateNotifications: (notifications: NotificationSettings) => call(() => updateSignedIn(() => ({ notifications }))),

  updateLicensing: (licensing: LicensingSettings) => call(() => updateSignedIn(() => ({ licensing }))),

  updateBillingAddress: (billingAddress: BillingAddress) => call(() => updateSignedIn(() => ({ billingAddress }))),

  // Changes the password, or sets one for an account that only signs in with Google, Apple or Facebook.
  changePassword: ({ current, next }: { current?: string; next: string }) =>
    call(async () => {
      const account = signedInAccount();
      if (account.passwordHash && account.passwordHash !== (await hashPassword(current ?? ''))) throw new ApiError('wrongPassword');
      return toSessionAccount(saveAccount({ ...account, passwordHash: await hashPassword(next), hasPassword: true }));
    }),

  // Simulated: links a Google / Apple / Facebook account so it can be used to sign in.
  linkProvider: (provider: SocialProvider, email: string) =>
    call(() => {
      const account = signedInAccount();
      const owner = findByEmail(email);
      if (owner && owner.id !== account.id) throw new ApiError('providerLinkedElsewhere', { provider });
      return updateSignedIn((current) => ({ linkedProviders: [...new Set([...current.linkedProviders, provider])] }));
    }),

  // Unlinks a provider. The account must keep at least one way to sign in.
  unlinkProvider: (provider: SocialProvider) =>
    call(() => {
      const account = signedInAccount();
      const remaining = account.linkedProviders.filter((linked) => linked !== provider);
      if (!account.passwordHash && remaining.length === 0) throw new ApiError('lastSignInMethod');
      return toSessionAccount(saveAccount({ ...account, linkedProviders: remaining }));
    }),

  completeTour: () => call(() => updateSignedIn(() => ({ tourCompletedAt: new Date().toISOString() }))),

  markReleasesSeen: () => call(() => updateSignedIn(() => ({ releasesSeenAt: new Date().toISOString() }))),

  // Adds a download to the queue and remembers its project for "remember my last choice".
  addDownload: ({ item, projectName, licenseCode }: DownloadRequest) =>
    call(() =>
      updateSignedIn((account) => {
        const download: Download = {
          id: crypto.randomUUID(),
          itemId: item.id,
          itemTitle: originalTitle(item),
          projectName,
          licenseCode,
          requestedAt: new Date().toISOString(),
        };
        return {
          downloads: [download, ...account.downloads],
          licensing: { ...account.licensing, lastProjectName: projectName },
        };
      }),
    ),

  // Saves an item to look at later, or removes it when it's already saved.
  toggleSaved: (itemId: string) =>
    call(() =>
      updateSignedIn((account) => ({
        savedItemIds: account.savedItemIds.includes(itemId)
          ? account.savedItemIds.filter((id) => id !== itemId)
          : [itemId, ...account.savedItemIds],
      })),
    ),

  // Deletes the signed-in account for good. The user confirms by typing their email.
  deleteAccount: (confirmEmail: string) =>
    call(() => {
      const account = signedInAccount();
      if (normalizeEmail(confirmEmail) !== account.email) throw new ApiError('confirmationMismatch');
      writeAccounts(readAccounts().filter((saved) => saved.id !== account.id));
      storage.remove(storageKeys.sessionUserId);
    }),

  // Starts a subscription and saves the billing address. Fawry payments stay pending until the code is paid.
  subscribe: ({ planId, duration, members, paymentMethod, autoRenew, studentId, billingAddress }: SubscribeRequest) =>
    call(() => {
      const account = signedInAccount();
      const plan = mockPlans.find((candidate) => candidate.id === planId);
      if (!plan) throw new ApiError('nothingToConfirm');
      const savedStudentId = studentId?.trim() || account.profile?.studentId;
      if (planId === 'student' && !savedStudentId) throw new ApiError('studentIdRequired');

      const { startedAt, endsAt } = periodFrom(new Date(), duration);
      const pending = paymentMethod === 'fawry';
      const seats = Math.max(members, plan.minMembers);
      const subscription: Subscription = {
        planId,
        duration,
        members: plan.perMember ? seats : 1,
        paymentMethod,
        autoRenew: autoRenew && cardPaymentMethods.includes(paymentMethod),
        total: getSubscriptionTotal(plan, duration, seats),
        status: pending ? 'pendingPayment' : 'active',
        startedAt,
        endsAt,
        ...(pending && { fawryCode: randomDigits(fawry.codeLength), payBy: minutesFromNow(fawry.payWithinHours * 60) }),
      };
      const profile = account.profile && savedStudentId ? { ...account.profile, studentId: savedStudentId } : account.profile;
      return toSessionAccount(saveAccount({ ...account, profile, subscription, billingAddress }));
    }),

  // Demo only: marks a pending Fawry payment as paid (in production Fawry notifies the server).
  confirmFawryPayment: () =>
    call(() => {
      const account = signedInAccount();
      if (account.subscription?.status !== 'pendingPayment') throw new ApiError('nothingToConfirm');
      // The plan period starts when the payment arrives, not when the code was created.
      const subscription: Subscription = {
        ...account.subscription,
        ...periodFrom(new Date(), account.subscription.duration),
        status: 'active',
        fawryCode: undefined,
        payBy: undefined,
      };
      return toSessionAccount(saveAccount({ ...account, subscription }));
    }),

  signOut: () =>
    call(() => {
      storage.remove(storageKeys.sessionUserId);
    }),
};
