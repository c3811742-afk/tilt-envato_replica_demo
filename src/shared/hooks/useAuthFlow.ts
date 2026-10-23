import { useNavigate, useSearchParams } from 'react-router';
import { returnToParam, routes, withReturnTo } from '@/shared/constants';
import { onboardingRoutes, onboardingState, safeReturnTo, type SessionAccount } from '@/shared/utils';
import { useSession } from './useSession';

// Moves the user through onboarding: sign up -> verify email -> complete profile -> the page they came for.
// The page to come back to (e.g. the checkout) travels along in the URL on every step.
export const useAuthFlow = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setAccount } = useSession();
  const returnTo = safeReturnTo(params.get(returnToParam));

  // Opens another onboarding page, keeping the page to come back to. `state` carries one-off data (e.g. a demo code).
  const goTo = (path: string, state?: unknown) => navigate(withReturnTo(path, returnTo), { state });

  // Saves the account in the session, then opens the next unfinished step, or the page the user came for.
  const continueWith = (account: SessionAccount) => {
    setAccount(account);
    const next = onboardingState({ status: 'signedIn', ...account });
    const path = next === 'ready' ? (returnTo ?? routes.home) : withReturnTo(onboardingRoutes[next], returnTo);
    navigate(path, { replace: true });
  };

  return { returnTo, goTo, continueWith };
};
