import type { ReportResolution } from '@/features/admin/types';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, respond } from './mockServer';

// Most searched first.
export const fetchNoClickSearches = () =>
  respond(() => [...db.noClickSearches].sort((a, b) => b.searches - a.searches));

// Open reports first, then newest first.
export const fetchSearchReports = () =>
  respond(() =>
    [...db.searchReports].sort(
      (a, b) => Number(b.status === 'open') - Number(a.status === 'open') || b.reportedAt.localeCompare(a.reportedAt),
    ),
  );

// Resolved: the element no longer shows for that search. Dismissed: the result was fine.
export const closeSearchReport = (actorId: string, id: string, resolution: ReportResolution) =>
  respond(() => {
    const actor = authorize(actorId, 'viewSearchInsights');
    const report = findById(db.searchReports, id);
    if (report.status !== 'open') throw new AdminApiError('alreadyClosed');

    report.status = resolution;
    logAction(
      actor,
      'searchReportClosed',
      { kind: 'searchReport', id: report.id, label: report.element.title },
      { change: resolution, term: report.term },
    );
    return report;
  });
