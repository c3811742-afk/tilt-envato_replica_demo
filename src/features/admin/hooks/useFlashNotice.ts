import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { flashNotices, type FlashNotice } from '@/features/admin/constants';
import { useRouteState } from '@/shared/hooks';
import { isOneOf } from '@/shared/utils';

// A success message passed to the next page: navigate(path, { state: flashState('accepted') }).
export const flashState = (notice: FlashNotice) => ({ notice });

// Reads the message passed by the previous page (with the shared useRouteState), and clears it when dismissed.
export const useFlashNotice = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { notice: passed } = useRouteState<{ notice: string }>();
  const notice = isOneOf(passed, flashNotices) ? passed : null;
  const dismiss = useCallback(() => navigate(pathname, { replace: true, state: null }), [navigate, pathname]);
  return { notice, dismiss };
};
