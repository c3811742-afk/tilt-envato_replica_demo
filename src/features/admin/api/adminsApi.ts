import type { Admin, AdminRole, NewAdminInput } from '@/features/admin/types';
import { AdminApiError } from './errors';
import { authorize, db, logAction, newId, now, respond } from './mockServer';

export const fetchAdmins = () => respond(() => db.admins);

export const createAdmin = (actorId: string, input: NewAdminInput) =>
  respond((): Admin => {
    const actor = authorize(actorId, 'manageAdmins');
    const email = input.email.trim().toLowerCase();
    if (db.admins.some((admin) => admin.email.toLowerCase() === email)) throw new AdminApiError('emailTaken');

    const admin: Admin = { id: newId(), name: input.name.trim(), email, role: input.role, createdAt: now() };
    db.admins.push(admin);
    logAction(actor, 'adminCreated', { kind: 'admin', id: admin.id, label: admin.name }, { role: admin.role });
    return admin;
  });

// Only super admins can change roles, and never their own, so there is always at least one super admin.
export const changeAdminRole = (actorId: string, adminId: string, role: AdminRole) =>
  respond((): Admin => {
    const actor = authorize(actorId, 'manageAdmins');
    const admin = db.admins.find((current) => current.id === adminId);
    if (!admin) throw new AdminApiError('notFound');
    if (admin.id === actor.id) throw new AdminApiError('ownRole');
    if (admin.role === role) return admin;

    const previousRole = admin.role;
    admin.role = role;
    logAction(actor, 'adminRoleChanged', { kind: 'admin', id: admin.id, label: admin.name }, { role, previousRole });
    return admin;
  });
