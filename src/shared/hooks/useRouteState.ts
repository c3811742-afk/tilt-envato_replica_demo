import { useLocation } from 'react-router';

// One-off data passed to a page when navigating to it (e.g. the demo code after sign-up).
// It's gone after a reload, so every field is optional and pages must work without it.
export const useRouteState = <T extends object>(): Partial<T> => {
  const { state } = useLocation();
  return state && typeof state === 'object' ? (state as Partial<T>) : {};
};
