import { useEffect, useState } from 'react';
import { progressTickMs } from '@/shared/constants';

// The current time, updated every tick while `inProgress(now)` is true (e.g. a download preparing,
// an AI image generating), so the page moves on to "Ready" by itself.
export const useNow = (inProgress: (now: number) => boolean, tickMs: number = progressTickMs) => {
  const [now, setNow] = useState(() => Date.now());
  const active = inProgress(now);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(timer);
  }, [active, tickMs]);
  return now;
};
