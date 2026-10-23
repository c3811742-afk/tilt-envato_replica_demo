import type { PaginationProps } from './Pagination.types';

export const paginationDefaults: Required<Pick<PaginationProps, 'page' | 'pageCount' | 'siblings'>> = {
  page: 1,
  pageCount: 1,
  siblings: 1,
};
