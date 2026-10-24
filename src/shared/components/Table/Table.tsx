import type { CSSProperties } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { tableDefaults } from './Table.defaults';
import type { TableColumn, TableProps } from './Table.types';
import styles from './Table.module.css';

const alignClass = (align: TableColumn['align']) => cx(align === 'end' && styles.end, align === 'center' && styles.center);

// A data table that scrolls sideways on its own when it is wider than the screen, so the page never does.
// With stackOnMobile, phones show each row as a card instead.
export const Table = (props: TableProps) => {
  const { columns, rows, label, rowHeaders, firstColumnWidth, emptyText, stackOnMobile } = withDefaults(tableDefaults, props);
  const style = { '--table-first-column': firstColumnWidth } as CSSProperties;

  return (
    <div className={styles.scroller} style={style}>
      <table className={cx(styles.table, rowHeaders && styles.rowHeaders, stackOnMobile && styles.stacked)} aria-label={label}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={alignClass(column.align)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && emptyText ? (
            <tr>
              <td colSpan={columns.length}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key}>
                {columns.map((column, index) =>
                  rowHeaders && index === 0 ? (
                    <th key={column.key} scope="row" className={alignClass(column.align)}>
                      {row.cells[column.key]}
                    </th>
                  ) : (
                    <td
                      key={column.key}
                      className={alignClass(column.align)}
                      data-label={typeof column.label === 'string' ? column.label : undefined}
                    >
                      {row.cells[column.key]}
                    </td>
                  ),
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
