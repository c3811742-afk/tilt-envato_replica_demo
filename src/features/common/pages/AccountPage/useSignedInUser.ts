import { useSession } from '@/shared/hooks';
import type { User } from '@/shared/types';

// The signed-in user. The account pages are behind the onboarding gate, so there always is one.
export const useSignedInUser = (): User => {
  const { session } = useSession();
  if (session.status !== 'signedIn') throw new Error('Account settings need a signed-in user');
  return session.user;
};
