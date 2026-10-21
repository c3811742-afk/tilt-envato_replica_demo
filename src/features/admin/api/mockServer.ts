import type { Permission } from '@/features/admin/constants';
import { mockConfig, seedAdmins, seedAuditLog, seedElements } from '@/features/admin/mocks';
import type { Admin, AuditAction, AuditDetails, AuditTarget } from '@/features/admin/types';
import { hasPermission } from '@/features/admin/utils/permissions';
import { AdminApiError } from './errors';

// In-memory "database". Changes last until the page is reloaded.
export const db = {
  admins: structuredClone(seedAdmins),
  elements: structuredClone(seedElements),
  auditLog: structuredClone(seedAuditLog),
};

export const newId = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulates a network call: waits, sometimes fails (see mockConfig), then runs `handle`.
// Returns a copy, so the page can't change the stored data by accident.
export const respond = async <T>(handle: () => T): Promise<T> => {
  await wait(mockConfig.delayMs);
  if (Math.random() < mockConfig.failureRate) throw new Error('Mock network error');
  return structuredClone(handle());
};

// The admin making the call, refused if their role doesn't allow the action.
export const authorize = (actorId: string, permission: Permission): Admin => {
  const actor = db.admins.find((admin) => admin.id === actorId);
  if (!actor || !hasPermission(actor.role, permission)) throw new AdminApiError('notAllowed');
  return actor;
};

// Every admin action goes through here, so nothing is missing from the audit log.
export const logAction = (actor: Admin, action: AuditAction, target: AuditTarget, details: AuditDetails = {}) => {
  db.auditLog.unshift({ id: newId(), at: now(), actorId: actor.id, actorName: actor.name, action, target, details });
};
