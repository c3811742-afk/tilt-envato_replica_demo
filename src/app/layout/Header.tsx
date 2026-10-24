import { NavLink, useLocation } from 'react-router';
import { Badge, Button, Icon, TopBar } from '@/shared/components';
import { navItems, navMenus, routes, withReturnTo } from '@/shared/constants';
import { useLocale, useSearchFilters, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { cx, formatNumber, unreadCount } from '@/shared/utils';
import { SearchBox } from '@/features/customer/components';
import { AccountMenu } from './AccountMenu';
import { AppearanceMenu } from './AppearanceMenu';
import { CategoriesMenu } from './CategoriesMenu';
import { LanguageMenu } from './LanguageMenu';
import styles from './Header.module.css';

export const Header = () => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const { pathname, search } = useLocation();
  const { query } = useSearchFilters();
  const currentQuery = pathname === routes.search ? query : '';
  const currentPage = `${pathname}${search}`; // signing in from the header comes back to this page
  const unread = session.status === 'signedIn' ? unreadCount(session.user) : 0;

  return (
    <TopBar
      search={<SearchBox key={currentQuery} defaultValue={currentQuery} />}
      actions={
        <>
          <AppearanceMenu />
          <LanguageMenu />

          {session.status === 'signedIn' ? (
            <>
              {/* data-tour: the first-login tour points at these. */}
              <span data-tour="notifications">
                <Button variant="outline" size="sm" iconOnly to={routes.notifications} ariaLabel={text.nav.notifications}>
                  <Icon name="bell" size={vars.sizes.icon.sm} />
                  {unread > 0 && <Badge variant="highlight">{formatNumber(unread, locale)}</Badge>}
                </Button>
              </span>
              <div data-tour="account">
                <AccountMenu user={session.user} subscription={session.subscription} />
              </div>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" to={withReturnTo(routes.signIn, currentPage)}>
                {text.common.signIn}
              </Button>
              <span className={styles.wideOnly}>
                <Button size="sm" to={withReturnTo(routes.signUp, currentPage)}>
                  {text.common.signUp}
                </Button>
              </span>
            </>
          )}
        </>
      }
      // A second row for the links, so the search box gets the full width of the first.
      below={
        <nav className={styles.nav} aria-label={text.nav.label}>
          {navMenus.header.map((key) => {
            const hasMenu = key === 'categories';
            const link = (
              <NavLink
                key={key}
                to={navItems[key].to}
                className={({ isActive }) => cx(styles.navLink, isActive && styles.active)}
              >
                {text.nav[key]}
                {hasMenu && <Icon name="chevronDown" size={vars.sizes.icon.sm} />}
              </NavLink>
            );
            return hasMenu ? <CategoriesMenu key={key} trigger={link} /> : link;
          })}
        </nav>
      }
    />
  );
};
