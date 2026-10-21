import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { flashNotices, type FlashNotice } from '@/features/admin/constants';
import { isOneOf } from '@/features/admin/utils';

const readNotice = (state: unknown): FlashNotice | null => {
  if (typeof state !== 'object' || state === null || !('notice' in state)) return null;
  return typeof state.notice === 'string' && isOneOf(flashNotices, state.notice) ? state.notice : null;
};

// A success message passed to the next page: navigate(path, { state: flashState('accepted') }).
export const flashState = (notice: FlashNotice) => ({ notice });

// Reads the message passed by the previous page, and clears it when dismissed.
export const useFlashNotice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const notice = readNotice(location.state);
  const dismiss = useCallback(
    () => navigate(location.pathname, { replace: true, state: null }),
    [navigate, location.pathname],
  );
  return { notice, dismiss };
};
