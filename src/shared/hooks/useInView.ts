import { useEffect, useRef } from 'react';
import { catalog } from '@/shared/constants';

// Calls `onVisible` when the element comes near the view (infinite scroll). Returns the ref to put on it.
export const useInView = <T extends Element>(onVisible: () => void, enabled = true) => {
  const ref = useRef<T>(null);
  const callback = useRef(onVisible);
  useEffect(() => {
    callback.current = onVisible;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    const margin = catalog.infiniteScrollMargin;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) callback.current();
      },
      { rootMargin: `${margin} 0% ${margin} 0%` },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
};
