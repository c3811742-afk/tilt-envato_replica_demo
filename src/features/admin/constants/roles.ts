import type { AdminRole } from '@/features/admin/types';

export const adminRoles: readonly AdminRole[] = ['superAdmin', 'reviewer', 'content', 'finance', 'support'];

// Which roles can do what. Checked by the pages (to show or hide) and by the mock API (to allow or refuse).
export const permissions = {
  review: ['superAdmin', 'reviewer'],
  unpublish: ['superAdmin', 'reviewer', 'content'],
  manageAdmins: ['superAdmin'],
  viewAuditLog: ['superAdmin'],
} as const satisfies Record<string, readonly AdminRole[]>;

export type Permission = keyof typeof permissions;
