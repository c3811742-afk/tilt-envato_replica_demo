import { db, respond } from './mockServer';

// Newest first (new entries are added to the start).
export const fetchAuditLog = () => respond(() => db.auditLog);
