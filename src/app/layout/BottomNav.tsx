import { NavLink } from 'react-router';
import { Icon } from '@/shared/components';
import { navItems, navMenus, routes, type NavKey } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { cx } from '@/shared/utils';
import styles from './BottomNav.module.css';

// Phone tab bar, the pattern Egyptian users know from Talabat, Noon and InstaPay. Hidden from tablet width up.
export const BottomNav = () => {
  const { text } = useLocale();
  // The tab bar's short label when there is one, otherwise the usual menu label.
  const tabLabel = (key: NavKey) => (key in text.navTabs ? text.navTabs[key as keyof typeof text.navTabs] : text.nav[key]);

  return (
    <nav className={styles.bottomNav} aria-label={text.nav.label}>
      {navMenus.phoneTabs.map((key) => {
        const { to, icon } = navItems[key];
        return (
          <NavLink key={key} to={to} end={to === routes.home} className={({ isActive }) => cx(styles.tab, isActive && styles.active)}>
            <Icon name={icon} />
            <span className={styles.label}>{tabLabel(key)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
