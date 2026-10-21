import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string; // also shown as the row label on phones
  render: (row: T) => ReactNode;
  align?: 'start' | 'end';
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  label?: string; // accessible name of the table, e.g. "Admins"
  stackOnMobile?: boolean; // on small screens each row becomes a card with labelled values
}
