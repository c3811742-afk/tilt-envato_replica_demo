import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { isOneOf } from '@/shared/utils';

// The selected tab, kept in the address (?tab=banners) so a link or a refresh opens the same tab.
// An unknown or missing tab falls back to the first one.
export const useTabParam = <T extends string>(tabs: readonly T[]) => {
  const [params, setParams] = useSearchParams();
  const value = params.get('tab');
  const tab = value && isOneOf(value, tabs) ? value : tabs[0];
  const setTab = useCallback((next: T) => setParams({ tab: next }, { replace: true }), [setParams]);
  return [tab, setTab] as const;
};
