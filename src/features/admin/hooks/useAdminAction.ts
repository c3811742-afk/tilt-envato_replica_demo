import { useCallback, useState } from 'react';
import { errorMessage } from '@/features/admin/utils';
import { useLocale } from '@/shared/hooks';
import { safeAsync } from '@/shared/utils';

// Runs an admin action (save, delete, send...) and tracks it: `pending` disables the button meanwhile,
// and `error` holds the friendly message when it fails. Returns the safeAsync result for anything more specific.
export const useAdminAction = () => {
  const { text } = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T>(call: () => Promise<T>) => {
      setPending(true);
      setError(null);
      const result = await safeAsync(call);
      setPending(false);
      if (!result.ok) setError(errorMessage(result.error, text));
      return result;
    },
    [text],
  );

  const clearError = useCallback(() => setError(null), []);

  return { run, pending, error, clearError };
};
