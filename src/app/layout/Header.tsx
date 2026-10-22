import { Link, NavLink, useLocation } from 'react-router';
import { Badge, Button, Container, Icon, SearchBar, Stack } from '@/shared/components';
import { navItems, navMenus, routes, withReturnTo } from '@/shared/constants';
import { useLocale, useSearchFilters, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { cx, formatNumber, unreadReleaseNotes } from '@/shared/utils';
import { AccountMenu } from './AccountMenu';
import { AppearanceMenu } from './AppearanceMenu';
import { LanguageMenu } from './LanguageMenu';
import styles from './Header.module.css';

export const Header = () => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const { pathname, search } = useLocation();
  const { query } = useSearchFilters();
  const currentQuery = pathname === routes.search ? query : '';
  const currentPage = `${pathname}${search}`; // signing in from the header comes back to this page
  const unread = session.status === 'signedIn' ? unreadReleaseNotes(session.user).length : 0;

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.content}>
          <Link to={routes.home} className={styles.logo} aria-label={text.brand.homeLabel}>
            {text.brand.name}
          </Link>

          <div className={styles.search}>
            <SearchBar key={currentQuery} defaultValue={currentQuery} />
          </div>

          <nav className={styles.nav} aria-label={text.nav.label}>
            {navMenus.header.map((key) => (
              <NavLink
                key={key}
                to={navItems[key].to}
                className={({ isActive }) => cx(styles.navLink, isActive && styles.active)}
              >
                {text.nav[key]}
              </NavLink>
            ))}
          </nav>

          <Stack direction="row" align="center" gap={vars.spacing[2]}>
            <AppearanceMenu />
            <LanguageMenu />

            {session.status === 'signedIn' ? (
              <>
                <Button variant="outline" size="sm" to={routes.notifications} ariaLabel={text.nav.notifications}>
                  <Icon name="bell" size={vars.sizes.icon.sm} />
                  {unread > 0 && <Badge variant="highlight">{formatNumber(unread, locale)}</Badge>}
                </Button>
                <AccountMenu user={session.user} subscription={session.subscription} />
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
          </Stack>
        </div>
      </Container>
    </header>
  );
};
