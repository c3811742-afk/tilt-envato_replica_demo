import { Navigate } from 'react-router';
import { adminNav } from '@/features/admin/constants';
import { useAdminSession } from '@/features/admin/hooks';
import { EmptyState } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

// /admin opens the first page the signed-in admin's role can use.
export const AdminHomePage = () => {
  const { can } = useAdminSession();
  const { text } = useLocale();
  const firstPage = adminNav.find((item) => can(item.permission));

  if (firstPage) return <Navigate to={firstPage.to} replace />;
  return <EmptyState title={text.admin.home.noPagesTitle} message={text.admin.home.noPagesMessage} />;
};
