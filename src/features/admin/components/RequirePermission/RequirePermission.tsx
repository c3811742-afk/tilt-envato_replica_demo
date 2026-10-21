import { useNavigate } from 'react-router';
import { useAdminSession } from '@/features/admin/hooks';
import { Button, StateMessage } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import type { RequirePermissionProps } from './RequirePermission.types';

// Shows the page only to roles that can use it; everyone else gets a clear "no access" message.
export const RequirePermission = ({ permission, children }: RequirePermissionProps) => {
  const { can } = useAdminSession();
  const { text } = useLocale();
  const navigate = useNavigate();

  if (can(permission)) return children;

  return (
    <StateMessage
      role="alert"
      title={text.admin.access.title}
      message={text.admin.access.message}
      actions={<Button onClick={() => navigate(routes.admin)}>{text.admin.access.back}</Button>}
    />
  );
};
