import { permissions, type Permission } from '@/features/admin/constants';
import type { AdminRole } from '@/features/admin/types';

export const hasPermission = (role: AdminRole, permission: Permission) =>
  (permissions[permission] as readonly AdminRole[]).includes(role);
