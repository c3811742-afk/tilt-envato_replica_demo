import type { ClaimDecision, ClaimStatus, RevokeInput } from '@/features/admin/types';
import { sameText } from '@/features/admin/utils/lists';
import { takeElementDown } from './elementsApi';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, now, respond } from './mockServer';

// Most recent first.
export const fetchLicenses = () => respond(() => [...db.licenses].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)));

// Finds a license by the code printed on its certificate. null when no license has that code.
export const findLicense = (code: string) =>
  respond(() => db.licenses.find((license) => sameText(license.code, code)) ?? null);

// A revoked license no longer covers the project. The customer is told, and the certificate shows "Revoked".
export const revokeLicense = (actorId: string, id: string, input: RevokeInput) =>
  respond(() => {
    const actor = authorize(actorId, 'manageLicenses');
    const license = findById(db.licenses, id);
    if (license.status === 'revoked') throw new AdminApiError('alreadyRevoked');

    license.status = 'revoked';
    license.revoke = { ...input, adminId: actor.id, at: now() };
    logAction(actor, 'licenseRevoked', { kind: 'license', id: license.id, label: license.code }, {
      revokeReason: input.reason,
      note: input.note || undefined,
    });
    return license;
  });

// New claims first, then the ones being looked at, then closed ones; newest first in each.
const claimOrder: Record<ClaimStatus, number> = { new: 0, investigating: 1, takenDown: 2, rejected: 2 };

export const fetchClaims = () =>
  respond(() =>
    [...db.claims].sort(
      (a, b) => claimOrder[a.status] - claimOrder[b.status] || b.receivedAt.localeCompare(a.receivedAt),
    ),
  );

// Investigating: looking into it. Taken down: the element is unpublished. Rejected: the element stays live.
export const decideClaim = (actorId: string, id: string, decision: ClaimDecision, note = '') =>
  respond(() => {
    const actor = authorize(actorId, 'manageLicenses');
    const claim = findById(db.claims, id);
    const closed = claim.status === 'takenDown' || claim.status === 'rejected';
    if (closed || claim.status === decision) throw new AdminApiError('alreadyClosed');

    claim.status = decision;
    claim.decisionNote = note.trim() || undefined;
    if (decision === 'takenDown') {
      takeElementDown(actor, claim.element.id, { reason: 'copyright', note: claim.decisionNote ?? '' });
    }
    logAction(actor, 'claimUpdated', { kind: 'claim', id: claim.id, label: claim.element.title }, {
      change: decision,
      note: claim.decisionNote,
    });
    return claim;
  });
