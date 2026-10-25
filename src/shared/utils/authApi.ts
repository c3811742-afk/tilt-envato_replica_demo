import { storageKeys, type SocialProvider } from '@/shared/constants';
import type { Locale } from '@/shared/theme';
import type { BillingAddress, LicensingSettings, NotificationSettings, UserProfile } from '@/shared/types';
import {
  call,
  checkCode,
  findByEmail,
  findById,
  hashPassword,
  issueCode,
  newAccount,
  normalizeEmail,
  readAccounts,
  saveAccount,
  signedInAccount,
  signedInAccountOrNull,
  startSession,
  toSessionAccount,
  updateSignedIn,
  withDueReminders,
  writeAccounts,
  type CodePurpose,
  type SessionAccount,
} from './accountStore';
import { ApiError } from './apiError';
import { withAutoRenewal } from './billingApi';
import { withDueAnnouncements, withOccasionReminders } from './studioApi';
import { nameFromEmail } from './session';
import { storage } from './storage';

// Accounts: sign up and sign in, verification codes, the profile and settings. (Plans and payments: billingApi;
// downloads, licenses, favorites and collections: libraryApi; the AI tool: aiApi.)

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

export const authApi = {
  // The signed-in account, read straight from storage (used when the app starts).
  // A due renewal reminder is added here, since the demo has no server running in the background.
  currentAccount: (): SessionAccount | null => {
    const account = signedInAccountOrNull();
    return account ? toSessionAccount(saveAccount(withDueAnnouncements(withOccasionReminders(withDueReminders(withAutoRenewal(account)))))) : null;
  },

  // The signed-in account as saved, without writing anything: for following changes made in another tab. Writing
  // here would let two open tabs overwrite each other's newer copy of the account.
  readCurrentAccount: (): SessionAccount | null => {
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

  // Marks every account notification as read (opening the Notifications page).
  markAlertsRead: () => call(() => updateSignedIn((account) => ({ alerts: account.alerts.map((alert) => ({ ...alert, read: true })) }))),

  // Deletes the signed-in account for good. The user confirms by typing their email.
  deleteAccount: (confirmEmail: string) =>
    call(() => {
      const account = signedInAccount();
      if (normalizeEmail(confirmEmail) !== account.email) throw new ApiError('confirmationMismatch');
      writeAccounts(readAccounts().filter((saved) => saved.id !== account.id));
      storage.remove(storageKeys.sessionUserId);
    }),

  signOut: () =>
    call(() => {
      storage.remove(storageKeys.sessionUserId);
    }),
};
