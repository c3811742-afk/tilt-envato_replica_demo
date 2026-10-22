import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { SessionContext } from '@/shared/hooks';
import type { Session } from '@/shared/types';
import { authApi, safeAsync, type SessionAccount } from '@/shared/utils';

const toSession = (account: SessionAccount | null): Session =>
  account ? { status: 'signedIn', user: account.user, subscription: account.subscription } : { status: 'guest' };

// Holds the signed-in account. It starts from the account saved in the browser, so a reload keeps you signed in.
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session>(() => toSession(authApi.currentAccount()));

  const setAccount = useCallback((account: SessionAccount) => setSession(toSession(account)), []);

  const signOut = useCallback(async () => {
    const result = await safeAsync(authApi.signOut);
    if (result.ok) setSession(toSession(null));
    return result;
  }, []);

  const value = useMemo(() => ({ session, setAccount, signOut }), [session, setAccount, signOut]);

  return <SessionContext value={value}>{children}</SessionContext>;
};
