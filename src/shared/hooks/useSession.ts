import { createContext, useContext } from 'react';
import type { Session } from '@/shared/types';
import type { Result, SessionAccount } from '@/shared/utils';

export interface SessionContextValue {
  session: Session;
  setAccount: (account: SessionAccount) => void; // after signing in or changing the account (verify, profile, subscribe)
  signOut: () => Promise<Result<void>>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

// Who is using the app: a guest, or a signed-in user with their subscription.
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside <SessionProvider>');
  return context;
};
