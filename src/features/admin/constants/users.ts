
import { routes } from '@/shared/constants';
import type { Permission } from './roles';
import type {
  AccountStatus,
  AdminAlertKey,
  ApplicationRejectReason,
  ApplicationStatus,
  IdRejectReason,
  UserKind,
} from '@/features/admin/types';
import { type BadgeVariant } from '@/shared/components';

export const userTabs = ['accounts', 'appeals', 'downloadAlerts'] as const;
export const userDetailTabs = ['subscriptions', 'downloads', 'licenses'] as const;
export const creatorTabs = ['applications', 'identity'] as const;

export const userKinds: readonly UserKind[] = ['customer', 'creator'];
export const accountStatuses: readonly AccountStatus[] = ['active', 'suspended', 'banned'];
export const applicationRejectReasons: readonly ApplicationRejectReason[] = ['portfolioQuality', 'notOriginal', 'incomplete', 'other'];
export const idRejectReasons: readonly IdRejectReason[] = ['unreadable', 'nameMismatch', 'expired', 'other'];

export const accountStatusTone: Record<AccountStatus, BadgeVariant> = { active: 'success', suspended: 'warning', banned: 'danger' };
export const applicationStatusTone: Record<ApplicationStatus, BadgeVariant> = { pending: 'info', approved: 'success', rejected: 'danger' };

// An account is flagged when it downloads at least `minimum` items in the last `windowHours`,
// and that is at least `timesUsual` times a normal day for it (the average of the 30 days before).
export const downloadAlertRule = { windowHours: 24, minimum: 40, timesUsual: 5, historyDays: 30 } as const;

// The top bar's alerts menu: what is waiting, where to deal with it, and who can.
export const adminAlertLinks: readonly { key: AdminAlertKey; to: string; permission: Permission }[] = [
  { key: 'reviews', to: routes.adminReview, permission: 'review' },
  { key: 'appeals', to: `${routes.adminUsers}?tab=appeals`, permission: 'manageUsers' },
  { key: 'downloadAlerts', to: `${routes.adminUsers}?tab=downloadAlerts`, permission: 'manageUsers' },
  { key: 'applications', to: routes.adminCreators, permission: 'reviewCreators' },
  { key: 'identityChecks', to: `${routes.adminCreators}?tab=identity`, permission: 'reviewCreators' },
  { key: 'tickets', to: routes.adminSupport, permission: 'handleSupport' },
];

// The counts shown next to sidebar links.
export const navAlertKeys: Partial<Record<string, readonly AdminAlertKey[]>> = {
  users: ['appeals', 'downloadAlerts'],
  creators: ['applications', 'identityChecks'],
  reviewQueue: ['reviews'],
  support: ['tickets'],
};
