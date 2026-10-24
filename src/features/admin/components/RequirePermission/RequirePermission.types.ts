import type { ReactNode } from 'react';
import type { Permission } from '@/features/admin/constants';

export interface RequirePermissionProps {
  permission: Permission;
  children?: ReactNode; // shown only when the signed-in admin's role has the permission
}
