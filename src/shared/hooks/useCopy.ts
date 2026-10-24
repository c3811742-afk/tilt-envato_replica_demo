import { useState } from 'react';
import { safeAsync } from '@/shared/utils';

export type CopyStatus = 'idle' | 'copied' | 'failed';

// Copies text to the clipboard and says whether it worked (a license code, a link to an item).
export const useCopy = () => {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const copy = async (text: string) => {
    const result = await safeAsync(() => navigator.clipboard.writeText(text));
    if (!result.ok) console.error('Copy to clipboard failed', result.error);
    setStatus(result.ok ? 'copied' : 'failed');
  };
  return { status, copy };
};
