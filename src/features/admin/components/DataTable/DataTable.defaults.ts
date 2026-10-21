import type { DataTableProps } from './DataTable.types';

export const dataTableDefaults: Required<Pick<DataTableProps<unknown>, 'stackOnMobile'>> = {
  stackOnMobile: true,
};
