import { Link, useNavigate } from 'react-router';
import type { AdminAlerts } from '@/features/admin/types';
import { AppearanceMenu, LanguageMenu } from '@/app/layout';
import { SearchBar } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { AdminAccountMenu } from './AdminAccountMenu';
import { AlertsMenu } from './AlertsMenu';
import styles from './AdminTopBar.module.css';

interface AdminTopBarProps {
  alerts: AdminAlerts | null; // null while loading or when the counts failed: the menu shows no numbers
}

// The admin top bar, like the site header: logo, search across the admin, alerts, theme, language and the admin's menu.
export const AdminTopBar = ({ alerts }: AdminTopBarProps) => {
  const { text } = useLocale();
  const navigate = useNavigate();
  const t = text.admin.topBar;

  const searchAdmin = (query: string) =>
    navigate({ pathname: routes.adminSearch, search: query ? `?${new URLSearchParams({ q: query })}` : '' });

  return (
    <header className={styles.topBar}>
      <div className={styles.content}>
        <Link to={routes.admin} className={styles.brand} aria-label={t.homeLabel}>
          <span className={styles.logo}>{text.brand.name}</span>
          <span className={styles.tag}>{text.admin.layout.title}</span>
        </Link>

        <div className={styles.search}>
          <SearchBar suggest={false} placeholder={t.searchPlaceholder} label={t.searchLabel} onSearch={searchAdmin} />
        </div>

        <div className={styles.actions}>
          <AlertsMenu alerts={alerts} />
          <AppearanceMenu />
          <LanguageMenu />
          <AdminAccountMenu />
        </div>
      </div>
    </header>
  );
};
