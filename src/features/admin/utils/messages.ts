import { adminErrorCode } from '@/features/admin/api';
import type { AuditEntry } from '@/features/admin/types';
import type { Text } from '@/shared/constants';
import type { Locale } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';
import { formatMoney } from './business';
import { fillText, formatList, isolate } from './text';

// The friendly message for a failed admin action (save, send, review...). Never shows technical details.
export const errorMessage = (error: unknown, text: Text) => {
  const code = adminErrorCode(error);
  return code ? text.admin.errors[code] : text.admin.errors.actionFailed;
};

// One readable line per detail of an audit entry (reasons, roles, note...).
export const describeAuditDetails = ({ details }: AuditEntry, text: Text, locale: Locale) => {
  const t = text.admin.audit.details;
  const lines: string[] = [];
  if (details.area) lines.push(fillText(t.area, { area: text.admin.audit.areas[details.area] }));
  if (details.change) lines.push(fillText(t.change, { change: text.admin.audit.changes[details.change] }));
  if (details.reasons?.length) {
    const reasons = details.reasons.map((reason) => text.admin.reasons[reason]);
    lines.push(fillText(t.reasons, { list: formatList(reasons, locale) }));
  }
  if (details.unpublishReason) {
    lines.push(fillText(t.reason, { reason: text.admin.unpublishReasons[details.unpublishReason] }));
  }
  if (details.deprecateReason) {
    lines.push(fillText(t.reason, { reason: text.admin.deprecateReasons[details.deprecateReason] }));
  }
  if (details.flagKind) lines.push(fillText(t.flagKind, { kind: text.admin.flagKinds[details.flagKind] }));
  if (details.role && details.previousRole) {
    lines.push(
      fillText(t.roleChange, { from: text.admin.roles[details.previousRole], to: text.admin.roles[details.role] }),
    );
  } else if (details.role) {
    lines.push(fillText(t.role, { role: text.admin.roles[details.role] }));
  }
  if (details.from && details.to) {
    lines.push(fillText(t.renamed, { from: isolate(details.from), to: isolate(details.to) }));
  }
  if (details.term) lines.push(fillText(t.term, { term: isolate(details.term) }));
  if (details.textKey) lines.push(fillText(t.textKey, { key: isolate(details.textKey) }));
  if (details.refundReason) lines.push(fillText(t.reason, { reason: text.admin.refundReasons[details.refundReason] }));
  if (details.cancelReason) lines.push(fillText(t.reason, { reason: text.admin.cancelReasons[details.cancelReason] }));
  if (details.revokeReason) lines.push(fillText(t.reason, { reason: text.admin.revokeReasons[details.revokeReason] }));
  if (details.reportKind) lines.push(fillText(t.report, { report: text.admin.reportKinds[details.reportKind] }));
  if (details.amount !== undefined) {
    lines.push(fillText(t.amount, { amount: formatMoney(details.amount, locale) }));
  }
  if (details.recipients !== undefined) {
    lines.push(fillText(t.recipients, { count: formatNumber(details.recipients, locale) }));
  }
  if (details.note) lines.push(fillText(t.note, { note: isolate(details.note) }));
  return lines;
};
