import { routes } from '@/shared/constants';
import type { Permission } from './roles';

// Sidebar links. Each one only shows for roles that have its permission.
export const adminNav = [
  { key: 'reviewQueue', to: routes.adminReview, permission: 'review' },
  { key: 'liveElements', to: routes.adminLiveElements, permission: 'unpublish' },
  { key: 'admins', to: routes.adminAdmins, permission: 'manageAdmins' },
  { key: 'auditLog', to: routes.adminAuditLog, permission: 'viewAuditLog' },
] as const satisfies readonly { key: string; to: string; permission: Permission }[];

// Success messages carried to the next page after a review decision.
export const flashNotices = ['accepted', 'softRejected', 'hardRejected'] as const;
export type FlashNotice = (typeof flashNotices)[number];
