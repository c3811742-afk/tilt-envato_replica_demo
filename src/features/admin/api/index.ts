// Mock admin API. Every function is async and can fail, like a real server.
export { fetchAdmins, createAdmin, changeAdminRole } from './adminsApi';
export {
  fetchReviewQueue,
  fetchElement,
  fetchLiveElements,
  reviewElement,
  flagElement,
  unpublishElement,
} from './elementsApi';
export { fetchAuditLog } from './auditApi';
export { AdminApiError, adminErrorCode } from './errors';
export type { AdminErrorCode } from './errors';
