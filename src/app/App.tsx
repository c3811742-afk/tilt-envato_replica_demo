import { HashRouter, Route, Routes } from 'react-router';
import { routes } from '@/shared/constants';
import { HomePage } from '@/features/customer/pages/HomePage';
import { NotFoundPage } from '@/features/common/pages/NotFoundPage';
import { AppErrorBoundary } from './AppErrorBoundary';
import { LocaleProvider } from './providers/LocaleProvider';

// HashRouter (URLs like /#/item/123): GitHub Pages has no server-side routing,
// so normal paths would 404 when a page is refreshed or opened from a link.
export const App = () => (
  <LocaleProvider>
    <HashRouter>
      <AppErrorBoundary>
        <Routes>
          <Route path={routes.home} element={<HomePage />} />
          <Route path={routes.notFound} element={<NotFoundPage />} />
        </Routes>
      </AppErrorBoundary>
    </HashRouter>
  </LocaleProvider>
);
