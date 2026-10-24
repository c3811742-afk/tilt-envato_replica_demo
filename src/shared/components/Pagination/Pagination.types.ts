export interface PaginationProps {
  page?: number; // 1-based
  pageCount?: number;
  pathFor?: (page: number) => string; // link to each page (from routes.ts)
  label?: string; // accessible name; defaults to "Pages" in the active language
  siblings?: number; // page numbers shown on each side of the current one
}
