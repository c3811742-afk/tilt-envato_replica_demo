import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storageKeys } from '@/shared/constants';
import { SessionContext } from '@/shared/hooks';
import type { Session } from '@/shared/types';
import { authApi, safeAsync, type SessionAccount } from '@/shared/utils';

const toSession = (account: SessionAccount | null): Session =>
  account ? { status: 'signedIn', ...account } : { status: 'guest' };

// Data the admin team (or another tab) can change for this account: the account itself (alerts, suspension, refunds),
// announcements, creator applications and payouts, team plans.
const accountDataKeys: string[] = [
  storageKeys.accounts,
  storageKeys.announcements,
  storageKeys.applications,
  storageKeys.studioPayouts,
  storageKeys.teams,
  storageKeys.sessionUserId,
];

// Holds the signed-in account. It starts from the account saved in the browser, so a reload keeps you signed in.
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session>(() => toSession(authApi.currentAccount()));

  // Follows changes made in another tab (e.g. an admin approves, refunds or sends an announcement) by reading the
  // account only: if every open tab saved it too, they would overwrite each other's newer copy. When the visitor comes
  // back to this tab or moves to another page, it's the one in use, so it also adds reminders and announcements that are due.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || accountDataKeys.includes(event.key)) setSession(toSession(authApi.readCurrentAccount()));
    };
    // Moving to another page (the hash router changes the hash) counts too: e.g. from the admin to Notifications.
    const onFocus = () => setSession(toSession(authApi.currentAccount()));
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    window.addEventListener('hashchange', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('hashchange', onFocus);
    };
  }, []);

  const setAccount = useCallback((account: SessionAccount) => setSession(toSession(account)), []);

  const signOut = useCallback(async () => {
    const result = await safeAsync(authApi.signOut);
    if (result.ok) setSession(toSession(null));
    return result;
  }, []);

  const value = useMemo(() => ({ session, setAccount, signOut }), [session, setAccount, signOut]);

  return <SessionContext value={value}>{children}</SessionContext>;
};
