import type { ReactNode } from 'react';

export interface TableColumn {
  key: string;
  label: ReactNode;
  align?: 'start' | 'end' | 'center';
}

export interface TableRow {
  key: string;
  cells: Record<string, ReactNode>; // one cell per column key
}

export interface TableProps {
  columns?: TableColumn[];
  rows?: TableRow[];
  label?: string; // accessible name of the table
  rowHeaders?: boolean; // the first column labels each row (e.g. a comparison table)
  firstColumnWidth?: string;
  emptyText?: ReactNode; // shown when there are no rows
}
