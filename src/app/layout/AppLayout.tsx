import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { PageBackground } from '@/shared/components';
import { ItemActionsContext, useSession } from '@/shared/hooks';
import type { Item } from '@/shared/types';
import { onboardingState } from '@/shared/utils';
import { SiteTour } from '@/features/common/components';
import { ItemSaveActions } from '@/features/customer/components';
import { BottomNav } from './BottomNav';
import { CookieBanner } from './CookieBanner';
import { CookieSettingsDialog } from './CookieSettingsDialog';
import { Footer } from './Footer';
import { Header } from './Header';
import { LanguageSuggestion } from './LanguageSuggestion';
import styles from './AppLayout.module.css';

// Every item card shows the favorite and "Save to collection" buttons.
const itemActions = (item: Item) => <ItemSaveActions item={item} />;

// Page frame shared by every page: header, content, footer, and the phone tab bar.
export const AppLayout = () => {
  const { pathname } = useLocation();
  const { session } = useSession();
  const showTour = onboardingState(session) === 'ready' && session.status === 'signedIn' && !session.user.tourCompletedAt;

  // A new page starts at the top, like a normal page load.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className={styles.layout}>
      <PageBackground />
      <LanguageSuggestion />
      <Header />
      <main className={styles.main}>
        <ItemActionsContext value={itemActions}>
          <Outlet />
        </ItemActionsContext>
      </main>
      <Footer />
      <BottomNav />
      <CookieBanner />
      <CookieSettingsDialog />
      {showTour && <SiteTour />}
    </div>
  );
};
