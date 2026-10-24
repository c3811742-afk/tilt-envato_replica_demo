import { Link } from 'react-router';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { cx, fillText, formatNumber, withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { paginationDefaults } from './Pagination.defaults';
import type { PaginationProps } from './Pagination.types';
import styles from './Pagination.module.css';

// The page numbers to show: the first, the last, and a few around the current page, with gaps between.
const visiblePages = (page: number, pageCount: number, siblings: number) => {
  const pages = new Set([1, pageCount]);
  for (let number = page - siblings; number <= page + siblings; number++) {
    if (number >= 1 && number <= pageCount) pages.add(number);
  }
  return [...pages].sort((a, b) => a - b);
};

// Previous / next and page number links under a list of results.
export const Pagination = (props: PaginationProps) => {
  const { page, pageCount, pathFor, label, siblings } = withDefaults(paginationDefaults, props);
  const { text, locale } = useLocale();
  if (pageCount <= 1 || !pathFor) return null;

  const pages = visiblePages(page, pageCount, siblings);
  const step = (target: number, icon: 'chevronStart' | 'chevronEnd', name: string) =>
    target >= 1 && target <= pageCount ? (
      <Link to={pathFor(target)} className={styles.link} aria-label={name} title={name}>
        <Icon name={icon} size={vars.sizes.icon.sm} />
      </Link>
    ) : (
      <span className={cx(styles.link, styles.disabled)} aria-hidden="true">
        <Icon name={icon} size={vars.sizes.icon.sm} />
      </span>
    );

  return (
    <nav aria-label={label ?? text.search.pagination} className={styles.pagination}>
      {step(page - 1, 'chevronStart', text.common.previous)}
      <ol className={styles.pages}>
        {pages.map((number, index) => (
          <li key={number} className={styles.item}>
            {index > 0 && number - pages[index - 1] > 1 && <span className={styles.gap}>…</span>}
            <Link
              to={pathFor(number)}
              className={cx(styles.link, number === page && styles.current)}
              aria-current={number === page ? 'page' : undefined}
              aria-label={fillText(text.search.goToPage, { page: formatNumber(number, locale) })}
            >
              {formatNumber(number, locale)}
            </Link>
          </li>
        ))}
      </ol>
      {step(page + 1, 'chevronEnd', text.common.nextPage)}
    </nav>
  );
};
