import { vars } from '@/shared/theme';
import type { TableProps } from './Table.types';

export const tableDefaults: Required<Pick<TableProps, 'columns' | 'rows' | 'rowHeaders' | 'firstColumnWidth'>> = {
  columns: [],
  rows: [],
  rowHeaders: false,
  firstColumnWidth: vars.sizes.table.firstColumn,
};
