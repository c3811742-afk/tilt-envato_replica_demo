import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { returnToParam, routes, withReturnTo } from '@/shared/constants';
import { useSession } from '@/shared/hooks';
import { onboardingRoutes, onboardingState, safeReturnTo, type OnboardingState } from '@/shared/utils';

interface OnboardingGateProps {
  allow: OnboardingState; // who the pages behind this gate are for
}

// Keeps every visitor on the right page for where they are in onboarding:
// guests are sent to sign in, new accounts to verify their email and complete their profile,
// and finished accounts away from the sign-in pages to the page they came for.
export const OnboardingGate = ({ allow }: OnboardingGateProps) => {
  const { session } = useSession();
  const { pathname, search } = useLocation();
  const [params] = useSearchParams();
  const state = onboardingState(session);

  if (state === allow) return <Outlet />;

  // Keep the page the visitor was heading to. A page that needs a finished account is itself that page.
  const returnTo = safeReturnTo(params.get(returnToParam)) ?? (allow === 'ready' ? `${pathname}${search}` : undefined);
  const target = state === 'ready' ? (returnTo ?? routes.home) : withReturnTo(onboardingRoutes[state], returnTo);
  return <Navigate to={target} replace />;
};
