import { BrowserRouter, Route, Routes } from 'react-router';
import { routes } from '@/shared/constants';
import { HomePage } from '@/features/customer/pages/HomePage';
import { NotFoundPage } from '@/features/common/pages/NotFoundPage';
import { AppErrorBoundary } from './AppErrorBoundary';
import { LocaleProvider } from './providers/LocaleProvider';

export const App = () => (
  <LocaleProvider>
    <BrowserRouter>
      <AppErrorBoundary>
        <Routes>
          <Route path={routes.home} element={<HomePage />} />
          <Route path={routes.notFound} element={<NotFoundPage />} />
        </Routes>
      </AppErrorBoundary>
    </BrowserRouter>
  </LocaleProvider>
);
