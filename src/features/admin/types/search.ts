// A search term people typed that got results nobody clicked, or no results at all.
export interface NoClickSearch {
  id: string;
  term: string;
  searches: number; // in the last 30 days
  results: number;
  lastSearchedAt: string;
}

export type ReportStatus = 'open' | 'resolved' | 'dismissed';
export type ReportResolution = Exclude<ReportStatus, 'open'>;

// A customer said an element doesn't match the search it showed up for.
export interface SearchReport {
  id: string;
  term: string;
  element: { id: string; title: string };
  note: string;
  reportedBy: string;
  reportedAt: string;
  status: ReportStatus;
}
