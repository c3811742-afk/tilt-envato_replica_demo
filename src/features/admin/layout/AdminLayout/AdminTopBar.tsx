import { useNavigate } from 'react-router';
import type { AdminAlerts } from '@/features/admin/types';
import { AppearanceMenu, LanguageMenu } from '@/app/layout';
import { Badge, SearchBar, TopBar } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
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
    // The site's top bar, with the admin's lime line under it and its own home, search and menus.
    <TopBar
      homeTo={routes.admin}
      homeLabel={t.homeLabel}
      contained={false}
      accentColor={vars.colors.navAccent}
      accentWidth={vars.borders.width.thick}
      tag={
        <span className={styles.tag}>
          <Badge background={vars.colors.nav} color={vars.colors.navAccent}>
            {text.admin.layout.title}
          </Badge>
        </span>
      }
      search={<SearchBar suggest={false} placeholder={t.searchPlaceholder} label={t.searchLabel} onSearch={searchAdmin} />}
      actions={
        <>
          <AlertsMenu alerts={alerts} />
          <AppearanceMenu />
          <LanguageMenu />
          <AdminAccountMenu />
        </>
      }
    />
  );
};
