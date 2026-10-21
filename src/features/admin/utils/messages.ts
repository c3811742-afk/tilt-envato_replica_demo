import { adminErrorCode } from '@/features/admin/api';
import type { AuditEntry } from '@/features/admin/types';
import type { Text } from '@/shared/constants';
import type { Locale } from '@/shared/theme';
import { fillText, formatList, isolate } from './text';

// The friendly message for a failed admin action. Never shows technical details.
export const errorMessage = (error: unknown, text: Text) => {
  const code = adminErrorCode(error);
  return code ? text.admin.errors[code] : text.states.error.message;
};

// One readable line per detail of an audit entry (reasons, roles, note...).
export const describeAuditDetails = ({ details }: AuditEntry, text: Text, locale: Locale) => {
  const t = text.admin.audit.details;
  const lines: string[] = [];
  if (details.reasons?.length) {
    const reasons = details.reasons.map((reason) => text.admin.reasons[reason]);
    lines.push(fillText(t.reasons, { list: formatList(reasons, locale) }));
  }
  if (details.unpublishReason) {
    lines.push(fillText(t.reason, { reason: text.admin.unpublishReasons[details.unpublishReason] }));
  }
  if (details.flagKind) lines.push(fillText(t.flagKind, { kind: text.admin.flagKinds[details.flagKind] }));
  if (details.role && details.previousRole) {
    lines.push(
      fillText(t.roleChange, { from: text.admin.roles[details.previousRole], to: text.admin.roles[details.role] }),
    );
  } else if (details.role) {
    lines.push(fillText(t.role, { role: text.admin.roles[details.role] }));
  }
  if (details.note) lines.push(fillText(t.note, { note: isolate(details.note) }));
  return lines;
};
