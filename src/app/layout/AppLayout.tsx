import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useSession } from '@/shared/hooks';
import { onboardingState } from '@/shared/utils';
import { TourDialog } from '@/features/common/components';
import { BottomNav } from './BottomNav';
import { CookieBanner } from './CookieBanner';
import { CookieSettingsDialog } from './CookieSettingsDialog';
import { Footer } from './Footer';
import { Header } from './Header';
import { LanguageSuggestion } from './LanguageSuggestion';
import styles from './AppLayout.module.css';

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
      <LanguageSuggestion />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <CookieBanner />
      <CookieSettingsDialog />
      {showTour && <TourDialog />}
    </div>
  );
};
