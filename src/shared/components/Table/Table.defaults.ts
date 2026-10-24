import { vars } from '@/shared/theme';
import type { TableProps } from './Table.types';

export const tableDefaults: Required<Pick<TableProps, 'columns' | 'rows' | 'rowHeaders' | 'firstColumnWidth' | 'stackOnMobile'>> = {
  columns: [],
  rows: [],
  rowHeaders: false,
  stackOnMobile: false,
  firstColumnWidth: vars.sizes.table.firstColumn,
};
