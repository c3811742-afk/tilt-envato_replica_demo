import type { AdminRole } from './admin';
import type { FlagKind, RejectReason, UnpublishReason } from './element';

export type AuditAction =
  | 'elementAccepted'
  | 'elementSoftRejected'
  | 'elementHardRejected'
  | 'elementFlagged'
  | 'elementUnpublished'
  | 'adminCreated'
  | 'adminRoleChanged';

export interface AuditTarget {
  kind: 'element' | 'admin';
  id: string;
  label: string; // the element title or admin name at the time of the action
}

export interface AuditDetails {
  reasons?: RejectReason[];
  unpublishReason?: UnpublishReason;
  flagKind?: FlagKind;
  role?: AdminRole;
  previousRole?: AdminRole;
  note?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  actorName: string; // kept so the entry still reads correctly if the admin changes later
  action: AuditAction;
  target: AuditTarget;
  details: AuditDetails;
}
