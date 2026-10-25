import type { AppealOutcome, ClaimDecision, ClaimStatus, CopyrightClaim, ElementAppeal, ElementAppealStatus, License, RevokeInput } from '@/features/admin/types';
import type { LicenseRecord, StudioElement } from '@/shared/types';
import {
  applyStudioAppealDecision,
  findAccountById,
  readAccounts,
  readLicenses,
  readStudioClaims,
  readStudioElements,
  revokeLicenseRecord,
  saveAccount,
  withAlert,
} from '@/shared/utils';
import { sameText } from '@/features/admin/utils/lists';
import { takeElementDown } from './elementsApi';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, now, respond } from './mockServer';

// Licenses from the site's license server (every download on the customer side in this browser), and the demo ones.
const fromSite = (record: LicenseRecord): License => ({
  id: record.code,
  code: record.code,
  element: { id: record.itemId, title: record.itemTitle },
  customer: { name: record.licenseeName, email: findAccountById(record.ownerId)?.email ?? '' },
  project: record.projectName,
  issuedAt: record.issuedAt,
  status: record.revoked ? 'revoked' : 'valid',
  revoke: record.revoked && { reason: record.revoked.reason, note: record.revoked.note ?? '', at: record.revoked.at },
  source: 'site',
});

export const allLicenses = () => [...readLicenses().map(fromSite), ...db.licenses];

// Most recent first.
export const fetchLicenses = () => respond(() => allLicenses().sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)));

// Finds a license by the code printed on its certificate. null when no license has that code.
export const findLicense = (code: string) => respond(() => allLicenses().find((license) => sameText(license.code, code)) ?? null);

// A revoked license no longer covers the project. The customer is told, and the license check shows "Revoked" with the reason.
export const revokeLicense = (actorId: string, id: string, input: RevokeInput) =>
  respond(() => {
    const actor = authorize(actorId, 'manageLicenses');
    const license = findById(allLicenses(), id);
    if (license.status === 'revoked') throw new AdminApiError('alreadyRevoked');

    let saved: License;
    if (license.source === 'site') {
      const record = revokeLicenseRecord(license.code, input.reason, input.note || undefined);
      if (!record) throw new AdminApiError('notFound');
      saved = fromSite(record);
    } else {
      saved = { ...license, status: 'revoked', revoke: { ...input, at: now() } };
      db.licenses = db.licenses.map((current) => (current.id === id ? saved : current));
    }
    logAction(actor, 'licenseRevoked', { kind: 'license', id: saved.id, label: saved.code }, {
      revokeReason: input.reason,
      note: input.note || undefined,
    });
    return saved;
  });

// Copyright reports sent from item pages on the site. The admin's decision is kept on the report itself.
const siteClaims = (): CopyrightClaim[] =>
  readAccounts().flatMap((account) =>
    account.copyrightReports.map((report): CopyrightClaim => {
      const decision = report.decision;
      return {
        id: report.id,
        reference: report.reference,
        claimant: { name: report.name, email: report.email },
        element: { id: report.itemId, title: report.itemTitle },
        originalLink: '',
        description: report.details,
        receivedAt: report.createdAt,
        status: decision?.status ?? 'new',
        decisionNote: decision?.note,
        source: 'site',
      };
    }),
  );

const allClaims = () => [...siteClaims(), ...db.claims];

// New claims first, then the ones being looked at, then closed ones; newest first in each.
const claimOrder: Record<ClaimStatus, number> = { new: 0, investigating: 1, takenDown: 2, rejected: 2 };

export const fetchClaims = () =>
  respond(() =>
    allClaims().sort(
      (a, b) => claimOrder[a.status] - claimOrder[b.status] || b.receivedAt.localeCompare(a.receivedAt),
    ),
  );

// Investigating: looking into it. Taken down: the element is unpublished. Rejected: the element stays live.
export const decideClaim = (actorId: string, id: string, decision: ClaimDecision, note = '') =>
  respond(() => {
    const actor = authorize(actorId, 'manageLicenses');
    const found = findById(allClaims(), id);
    const closed = found.status === 'takenDown' || found.status === 'rejected';
    if (closed || found.status === decision) throw new AdminApiError('alreadyClosed');

    const claim: CopyrightClaim = { ...found, status: decision, decisionNote: note.trim() || undefined };
    if (claim.source === 'site') {
      // Saved on the reporter's account, and they're told the outcome.
      const reporter = readAccounts().find((account) => account.copyrightReports.some((report) => report.id === id));
      if (reporter) {
        const updated = {
          ...reporter,
          copyrightReports: reporter.copyrightReports.map((report) => (report.id === id ? { ...report, decision: { status: decision, note: claim.decisionNote } } : report)),
        };
        saveAccount(withAlert(updated, 'reportAnswered', { title: claim.element.title, outcome: decision }));
      }
    }
    else db.claims = db.claims.map((current) => (current.id === id ? claim : current));
    if (decision === 'takenDown') {
      takeElementDown(actor, claim.element.id, { reason: 'copyright', note: claim.decisionNote ?? '' });
    }
    logAction(actor, 'claimUpdated', { kind: 'claim', id: claim.id, label: claim.element.title }, {
      change: decision,
      note: claim.decisionNote,
    });
    return claim;
  });

// ---------- Takedown appeals ----------
// Creators appeal copyright takedowns of their elements. Republishing puts the element back (the claim was a
// false positive); keeping it down needs a note, because the creator reads it.

const toAppeal = (element: StudioElement): ElementAppeal | null => {
  if (!element.appeal) return null;
  const title = element.title[element.language];
  const claim = readStudioClaims().find((current) => current.elementId === element.id);
  return {
    id: element.id,
    element: { id: element.id, title },
    creator: { id: element.creatorId, name: element.creatorName },
    claimReference: claim?.reference,
    takedownNote: element.unpublish?.note ?? '',
    message: element.appeal.message,
    receivedAt: element.appeal.at,
    status: element.appeal.status,
    decisionNote: element.appeal.note,
  };
};

const allAppeals = () => readStudioElements().flatMap((element) => toAppeal(element) ?? []);

// Open appeals first, newest first in each group.
const appealOrder: Record<ElementAppealStatus, number> = { open: 0, accepted: 1, rejected: 1 };

export const fetchElementAppeals = () =>
  respond(() => allAppeals().sort((a, b) => appealOrder[a.status] - appealOrder[b.status] || b.receivedAt.localeCompare(a.receivedAt)));

export const decideElementAppeal = (actorId: string, elementId: string, outcome: AppealOutcome, note = '') =>
  respond(() => {
    const actor = authorize(actorId, 'manageLicenses');
    const found = findById(allAppeals(), elementId);
    if (found.status !== 'open') throw new AdminApiError('alreadyDecided');

    const saved = applyStudioAppealDecision(elementId, outcome === 'accepted', note);
    const appeal = saved && toAppeal(saved);
    if (!appeal) throw new AdminApiError('notFound');
    logAction(actor, 'appealDecided', { kind: 'element', id: elementId, label: found.element.title }, {
      change: outcome === 'accepted' ? 'approved' : 'rejected',
      note: note.trim() || undefined,
    });
    return appeal;
  });
