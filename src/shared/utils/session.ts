import { routes } from '@/shared/constants';
import type { Session, Subscription } from '@/shared/types';

// The subscription that gives access right now: paid and not ended.
export const isSubscriptionActive = (subscription: Subscription | null, now: Date = new Date()) =>
  subscription?.status === 'active' && new Date(subscription.endsAt) > now;

// The signed-in user's subscription when it gives access right now, otherwise null.
export const activeSubscription = (session: Session) =>
  session.status === 'signedIn' && isSubscriptionActive(session.subscription) ? session.subscription : null;

// The signed-in user's project pass while it is still running, otherwise null.
export const activePass = (session: Session, now: Date = new Date()) =>
  session.status === 'signedIn' && session.pass && new Date(session.pass.endsAt) > now ? session.pass : null;

// Where a visitor is in onboarding: not signed in, signed in with steps left, or ready.
export type OnboardingState = 'guest' | 'verifyEmail' | 'completeProfile' | 'verifyPhone' | 'ready';

export const onboardingState = (session: Session): OnboardingState => {
  if (session.status === 'guest') return 'guest';
  if (!session.user.emailVerified) return 'verifyEmail';
  if (!session.user.profile) return 'completeProfile';
  if (!session.user.phoneVerified) return 'verifyPhone';
  return 'ready';
};

// The page for each unfinished state. "ready" has none: the user goes where they were heading.
export const onboardingRoutes: Record<Exclude<OnboardingState, 'ready'>, string> = {
  guest: routes.signIn,
  verifyEmail: routes.verifyEmail,
  completeProfile: routes.completeProfile,
  verifyPhone: routes.verifyPhone,
};

// Only paths inside the app are followed after signing in, never an outside address.
export const safeReturnTo = (value: string | null | undefined) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : undefined;

// "nour@example.com" -> "nour": a display name until the user enters their real name.
export const nameFromEmail = (email: string) => email.split('@')[0];
