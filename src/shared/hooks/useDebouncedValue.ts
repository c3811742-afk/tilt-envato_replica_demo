import { useEffect, useState } from 'react';

// `value`, but only once it has stopped changing for `delayMs` (e.g. search suggestions while typing).
export const useDebouncedValue = <T>(value: T, delayMs: number) => {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return settled;
};
