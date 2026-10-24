import type { NoClickSearch, ReportResolution, SearchReport } from '@/features/admin/types';
import { isOneOf } from '@/features/admin/utils/lists';
import { searchReportReasons } from '@/shared/constants';
import { emptySearchStore, searchReportStore } from '@/shared/utils';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, respond } from './mockServer';

// Searches on the site that found nothing, counted by term (the demo's numbers come on top).
const siteEmptySearches = (): NoClickSearch[] => {
  const byTerm = new Map<string, NoClickSearch>();
  emptySearchStore.get().forEach(({ term, at }) => {
    const key = term.toLocaleLowerCase();
    const current = byTerm.get(key);
    byTerm.set(key, {
      id: `site-${key}`,
      term: current?.term ?? term,
      searches: (current?.searches ?? 0) + 1,
      results: 0,
      lastSearchedAt: current && current.lastSearchedAt > at ? current.lastSearchedAt : at,
    });
  });
  return [...byTerm.values()];
};

// Most searched first.
export const fetchNoClickSearches = () =>
  respond(() => [...siteEmptySearches(), ...db.noClickSearches].sort((a, b) => b.searches - a.searches));

// "Report these results" from the site's search page. The team's answer is kept here.
const siteReports = (): SearchReport[] =>
  searchReportStore.get().map((report) => ({
    id: report.id,
    term: report.query,
    reason: isOneOf(searchReportReasons, report.reason) ? report.reason : undefined,
    note: report.comment,
    reportedBy: report.reportedBy,
    reportedAt: report.at,
    status: db.siteSearchReportStatus[report.id] ?? 'open',
    source: 'site',
  }));

const allReports = () => [...siteReports(), ...db.searchReports];

// Open reports first, then newest first.
export const fetchSearchReports = () =>
  respond(() =>
    allReports().sort(
      (a, b) => Number(b.status === 'open') - Number(a.status === 'open') || b.reportedAt.localeCompare(a.reportedAt),
    ),
  );

// Resolved: the results were fixed. Dismissed: the results were fine.
export const closeSearchReport = (actorId: string, id: string, resolution: ReportResolution) =>
  respond(() => {
    const actor = authorize(actorId, 'viewSearchInsights');
    const found = findById(allReports(), id);
    if (found.status !== 'open') throw new AdminApiError('alreadyClosed');

    const report: SearchReport = { ...found, status: resolution };
    if (report.source === 'site') db.siteSearchReportStatus[id] = resolution;
    else db.searchReports = db.searchReports.map((current) => (current.id === id ? report : current));
    logAction(
      actor,
      'searchReportClosed',
      { kind: 'searchReport', id: report.id, label: report.element?.title ?? report.term },
      { change: resolution, term: report.term },
    );
    return report;
  });
