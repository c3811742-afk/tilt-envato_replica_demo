import { useCallback, useState } from 'react';
import type { Result } from '@/shared/utils';
import { safeAsync } from '@/shared/utils';
import { useMessages } from './useMessages';
import { useSession } from './useSession';

// Runs an action (save, delete, send…) and tracks it: `busy` while it runs (disable the button), and `error`,
// the friendly message when it fails. `run` returns the safeAsync result for anything more specific.
// `explain` turns a failure into that message; by default the site's request error text.
export const useAction = (explain?: (error: unknown) => string) => {
  const { requestError } = useMessages();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const describe = explain ?? requestError;

  const run = useCallback(
    async <T>(action: () => Promise<T>): Promise<Result<T>> => {
      setBusy(true);
      setError(undefined);
      const result = await safeAsync(action);
      setBusy(false);
      if (!result.ok) setError(describe(result.error));
      return result;
    },
    [describe],
  );
  const clearError = useCallback(() => setError(undefined), []);

  return { run, busy, error, setError, clearError };
};

type Account = Parameters<ReturnType<typeof useSession>['setAccount']>[0];

// `run(request)` for requests that return the account; `run(request, toAccount)` for ones that return more
// (e.g. a new collection and the account). Resolves to the request's data, or null when it failed.
interface AccountRun {
  (request: () => Promise<Account>): Promise<Account | null>;
  <T>(request: () => Promise<T>, toAccount: (data: T) => Account): Promise<T | null>;
}

// The same, for actions that change the signed-in account (most customer actions): on success the app's
// account is updated with what the action returned.
export const useAccountAction = () => {
  const { setAccount } = useSession();
  const action = useAction();
  const { run: runAction } = action;

  const run = useCallback(
    async <T>(request: () => Promise<T>, toAccount: (data: T) => Account = (data) => data as Account) => {
      const result = await runAction(request);
      if (!result.ok) return null;
      setAccount(toAccount(result.data));
      return result.data;
    },
    [runAction, setAccount],
  ) as AccountRun;

  return { ...action, run };
};
