import type { SearchReportReason } from '@/shared/constants';
import type { LocalizedText } from './catalog';

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

// A customer said an element doesn't match the search it showed up for, or (from the site's search page)
// that the results as a whole were wrong.
export interface SearchReport {
  id: string;
  term: string;
  element?: { id: string; title: string }; // missing: the report is about all the results
  reason?: SearchReportReason; // site reports: what went wrong
  note: string;
  reportedBy: string;
  reportedAt: string;
  status: ReportStatus;
  source?: 'demo' | 'site';
}

// ---------- Searching the whole admin (the top bar) ----------

export type AdminSearchGroup =
  | 'pages'
  | 'people'
  | 'elements'
  | 'categories'
  | 'tags'
  | 'tickets'
  | 'licenses'
  | 'payments'
  | 'invoices'
  | 'promoCodes'
  | 'applications'
  | 'content'
  | 'admins';

export interface AdminSearchResult {
  group: AdminSearchGroup;
  id: string;
  title: string;
  titles?: LocalizedText; // for things named in both languages: shown in the page's language
  detail?: string; // a second line, e.g. an email address
  to: string; // where it is handled
}
