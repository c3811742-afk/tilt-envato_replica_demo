import { cx, withDefaults } from '@/shared/utils';
import { dataTableDefaults } from './DataTable.defaults';
import type { DataTableProps } from './DataTable.types';
import styles from './DataTable.module.css';

// A table on desktop; on phones (with stackOnMobile) each row becomes a stacked card.
export const DataTable = <T,>(props: DataTableProps<T>) => {
  const { columns, rows, getRowKey, label, stackOnMobile } = withDefaults(dataTableDefaults, props);

  return (
    <div className={styles.wrapper}>
      <table className={cx(styles.table, stackOnMobile && styles.stacked)} aria-label={label}>
        <thead className={styles.head}>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={cx(styles.headerCell, column.align === 'end' && styles.end)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className={styles.row}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  data-label={column.header}
                  className={cx(styles.cell, column.align === 'end' && styles.end)}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
