import { HashRouter, Route, Routes } from 'react-router';
import { routes } from '@/shared/constants';
import { HomePage } from '@/features/customer/pages/HomePage';
import { NotFoundPage } from '@/features/common/pages/NotFoundPage';
import {
  AdminHomePage,
  AdminLayout,
  AdminsPage,
  AiPage,
  AuditLogPage,
  BillingPage,
  CategoriesPage,
  CategoryDetailsPage,
  DashboardPage,
  HomepagePage,
  InvoicesPage,
  LanguagesPage,
  LicensesPage,
  LiveElementsPage,
  MessagesPage,
  PayoutsPage,
  PlansPage,
  ProgramsPage,
  ReviewElementPage,
  ReviewQueuePage,
  SearchInsightsPage,
  SiteContentPage,
  SupportPage,
  TagsPage,
  TicketPage,
  TranslationsPage,
  UnusedElementsPage,
} from '@/features/admin';
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
          <Route path={routes.admin} element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path={routes.adminDashboard} element={<DashboardPage />} />
            <Route path={routes.adminReview} element={<ReviewQueuePage />} />
            <Route path={routes.adminReviewElement} element={<ReviewElementPage />} />
            <Route path={routes.adminLiveElements} element={<LiveElementsPage />} />
            <Route path={routes.adminCategories} element={<CategoriesPage />} />
            <Route path={routes.adminCategory} element={<CategoryDetailsPage />} />
            <Route path={routes.adminTags} element={<TagsPage />} />
            <Route path={routes.adminHomepage} element={<HomepagePage />} />
            <Route path={routes.adminUnusedElements} element={<UnusedElementsPage />} />
            <Route path={routes.adminSearchInsights} element={<SearchInsightsPage />} />
            <Route path={routes.adminContent} element={<SiteContentPage />} />
            <Route path={routes.adminLanguages} element={<LanguagesPage />} />
            <Route path={routes.adminTranslations} element={<TranslationsPage />} />
            <Route path={routes.adminMessages} element={<MessagesPage />} />
            <Route path={routes.adminPrograms} element={<ProgramsPage />} />
            <Route path={routes.adminAi} element={<AiPage />} />
            <Route path={routes.adminPlans} element={<PlansPage />} />
            <Route path={routes.adminBilling} element={<BillingPage />} />
            <Route path={routes.adminPayouts} element={<PayoutsPage />} />
            <Route path={routes.adminInvoices} element={<InvoicesPage />} />
            <Route path={routes.adminSupport} element={<SupportPage />} />
            <Route path={routes.adminTicket} element={<TicketPage />} />
            <Route path={routes.adminLicenses} element={<LicensesPage />} />
            <Route path={routes.adminAdmins} element={<AdminsPage />} />
            <Route path={routes.adminAuditLog} element={<AuditLogPage />} />
          </Route>
          <Route path={routes.notFound} element={<NotFoundPage />} />
        </Routes>
      </AppErrorBoundary>
    </HashRouter>
  </LocaleProvider>
);
