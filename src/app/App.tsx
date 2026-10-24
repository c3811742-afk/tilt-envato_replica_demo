import { HashRouter, Route, Routes } from 'react-router';
import { companyPages, routes } from '@/shared/constants';
import { HomePage } from '@/features/customer/pages/HomePage';
import { SearchPage } from '@/features/customer/pages/SearchPage';
import { ItemPage } from '@/features/customer/pages/ItemPage';
import { CategoriesPage } from '@/features/customer/pages/CategoriesPage';
import { HowItWorksPage } from '@/features/customer/pages/HowItWorksPage';
import { PricingPage } from '@/features/customer/pages/PricingPage';
import { FaqPage } from '@/features/customer/pages/FaqPage';
import { CheckoutPage } from '@/features/customer/pages/CheckoutPage';
import { CreatorPage } from '@/features/customer/pages/CreatorPage';
import { CollectionsPage } from '@/features/customer/pages/CollectionsPage';
import { CollectionPage } from '@/features/customer/pages/CollectionPage';
import { FavoritesPage } from '@/features/customer/pages/FavoritesPage';
import { MyCollectionsPage } from '@/features/customer/pages/MyCollectionsPage';
import { MyCollectionPage } from '@/features/customer/pages/MyCollectionPage';
import { SharedCollectionPage } from '@/features/customer/pages/SharedCollectionPage';
import { DownloadsPage } from '@/features/customer/pages/DownloadsPage';
import { ContactSalesPage } from '@/features/customer/pages/ContactSalesPage';
import { SignInPage } from '@/features/common/pages/SignInPage';
import { SignUpPage } from '@/features/common/pages/SignUpPage';
import { VerifyEmailPage } from '@/features/common/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '@/features/common/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/common/pages/ResetPasswordPage';
import { CompleteProfilePage } from '@/features/common/pages/CompleteProfilePage';
import { TermsPage } from '@/features/common/pages/TermsPage';
import { PrivacyPage } from '@/features/common/pages/PrivacyPage';
import { VerifyPhonePage } from '@/features/common/pages/VerifyPhonePage';
import { AccountPage } from '@/features/common/pages/AccountPage';
import { NotificationsPage } from '@/features/common/pages/NotificationsPage';
import { NotFoundPage } from '@/features/common/pages/NotFoundPage';
import { LicenseCheckPage } from '@/features/common/pages/LicenseCheckPage';
import { AiHubPage } from '@/features/common/pages/AiHubPage';
import { AiToolPage } from '@/features/common/pages/AiToolPage';
import { AiHistoryPage } from '@/features/common/pages/AiHistoryPage';
import { AiGuidesPage } from '@/features/common/pages/AiGuidesPage';
import { DemoPage } from '@/features/common/pages/DemoPage';
import { TeamPage } from '@/features/common/pages/TeamPage';
import { SupportPage } from '@/features/common/pages/SupportPage';
import { AccountSuspendedPage } from '@/features/common/pages/AccountSuspendedPage';
import { HelpArticlePage, HelpCenterPage } from '@/features/common/pages/HelpCenterPage';
import { LearnGuidePage, LearnPage } from '@/features/common/pages/LearnPage';
import { BlogPage, BlogPostPage } from '@/features/common/pages/BlogPage';
import { CoursePage, CoursesPage } from '@/features/common/pages/CoursesPage';
import { CompanyPage } from '@/features/common/pages/CompanyPage';
import { AuthorsPage, PartnersPage } from '@/features/common/pages/ProgramsPage';
import { FairUsePage, LicenseTermsPage } from '@/features/common/pages/LegalPages';
import { UnsubscribePage } from '@/features/common/pages/UnsubscribePage';
import { CreatorOnboardingPage } from '@/features/creator/pages/CreatorOnboardingPage';
import {
  AdminHomePage,
  AdminLayout,
  AdminsPage,
  AiPage,
  AuditLogPage,
  BillingPage,
  CategoriesPage as AdminCategoriesPage,
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
  SupportPage as AdminSupportPage,
  TagsPage,
  TicketPage,
  TranslationsPage,
  UnusedElementsPage,
  UserPage,
  UsersPage,
  CreatorsPage,
  AdminSearchPage,
} from '@/features/admin';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AppLayout } from './layout';
import { AppearanceProvider } from './providers/AppearanceProvider';
import { CookieConsentProvider } from './providers/CookieConsentProvider';
import { LocaleProvider } from './providers/LocaleProvider';
import { SessionProvider } from './providers/SessionProvider';
import { OnboardingGate } from './routing';

// HashRouter (URLs like /#/item/123): GitHub Pages has no server-side routing,
// so normal paths would 404 when a page is refreshed or opened from a link.
export const App = () => (
  <AppearanceProvider>
    <LocaleProvider>
      <SessionProvider>
        <CookieConsentProvider>
          <HashRouter>
            <AppErrorBoundary>
              <Routes>
                {/* The admin area has its own layout: sidebar and admin top bar, no customer header or footer. */}
                <Route path={routes.admin} element={<AdminLayout />}>
                  <Route index element={<AdminHomePage />} />
                  <Route path={routes.adminDashboard} element={<DashboardPage />} />
                  <Route path={routes.adminSearch} element={<AdminSearchPage />} />
                  <Route path={routes.adminUsers} element={<UsersPage />} />
                  <Route path={routes.adminUser} element={<UserPage />} />
                  <Route path={routes.adminCreators} element={<CreatorsPage />} />
                  <Route path={routes.adminReview} element={<ReviewQueuePage />} />
                  <Route path={routes.adminReviewElement} element={<ReviewElementPage />} />
                  <Route path={routes.adminLiveElements} element={<LiveElementsPage />} />
                  <Route path={routes.adminCategories} element={<AdminCategoriesPage />} />
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
                  <Route path={routes.adminSupport} element={<AdminSupportPage />} />
                  <Route path={routes.adminTicket} element={<TicketPage />} />
                  <Route path={routes.adminLicenses} element={<LicensesPage />} />
                  <Route path={routes.adminAdmins} element={<AdminsPage />} />
                  <Route path={routes.adminAuditLog} element={<AuditLogPage />} />
                </Route>
                <Route element={<AppLayout />}>
                  <Route path={routes.home} element={<HomePage />} />
                  <Route path={routes.search} element={<SearchPage />} />
                  <Route path={routes.item} element={<ItemPage />} />
                  <Route path={routes.categories} element={<CategoriesPage />} />
                  <Route path={routes.creator} element={<CreatorPage />} />
                  <Route path={routes.collections} element={<CollectionsPage />} />
                  <Route path={routes.collection} element={<CollectionPage />} />
                  <Route path={routes.howItWorks} element={<HowItWorksPage />} />
                  <Route path={routes.pricing} element={<PricingPage />} />
                  <Route path={routes.faq} element={<FaqPage />} />
                  <Route path={routes.terms} element={<TermsPage />} />
                  <Route path={routes.privacy} element={<PrivacyPage />} />
                  <Route path={routes.licenseCheck} element={<LicenseCheckPage />} />
                  <Route path={routes.sharedCollection} element={<SharedCollectionPage />} />
                  <Route path={routes.contactSales} element={<ContactSalesPage />} />
                  <Route path={routes.demo} element={<DemoPage />} />
                  <Route path={routes.ai} element={<AiHubPage />} />
                  <Route path={routes.aiTool} element={<AiToolPage />} />
                  <Route path={routes.aiGuides} element={<AiGuidesPage />} />
                  <Route path={routes.support} element={<SupportPage />} />
                  <Route path={routes.help} element={<HelpCenterPage />} />
                  <Route path={routes.helpArticle} element={<HelpArticlePage />} />
                  <Route path={routes.learn} element={<LearnPage />} />
                  <Route path={routes.learnGuide} element={<LearnGuidePage />} />
                  <Route path={routes.blog} element={<BlogPage />} />
                  <Route path={routes.blogPost} element={<BlogPostPage />} />
                  <Route path={routes.courses} element={<CoursesPage />} />
                  <Route path={routes.course} element={<CoursePage />} />
                  {companyPages.map((page) => (
                    <Route key={page} path={routes[page]} element={<CompanyPage page={page} />} />
                  ))}
                  <Route path={routes.authors} element={<AuthorsPage />} />
                  <Route path={routes.partners} element={<PartnersPage />} />
                  <Route path={routes.licenseTerms} element={<LicenseTermsPage />} />
                  <Route path={routes.fairUse} element={<FairUsePage />} />
                  <Route path={routes.unsubscribe} element={<UnsubscribePage />} />
                  <Route path={routes.creatorOnboarding} element={<CreatorOnboardingPage />} />

                  {/* Onboarding: each page is only shown at its step; anyone else is sent to theirs. */}
                  <Route element={<OnboardingGate allow="guest" />}>
                    <Route path={routes.signIn} element={<SignInPage />} />
                    <Route path={routes.signUp} element={<SignUpPage />} />
                    <Route path={routes.forgotPassword} element={<ForgotPasswordPage />} />
                    <Route path={routes.resetPassword} element={<ResetPasswordPage />} />
                  </Route>
                  <Route element={<OnboardingGate allow="verifyEmail" />}>
                    <Route path={routes.verifyEmail} element={<VerifyEmailPage />} />
                  </Route>
                  <Route element={<OnboardingGate allow="completeProfile" />}>
                    <Route path={routes.completeProfile} element={<CompleteProfilePage />} />
                  </Route>
                  <Route element={<OnboardingGate allow="verifyPhone" />}>
                    <Route path={routes.verifyPhone} element={<VerifyPhonePage />} />
                  </Route>
                  <Route element={<OnboardingGate allow="suspended" />}>
                    <Route path={routes.accountSuspended} element={<AccountSuspendedPage />} />
                  </Route>
                  <Route element={<OnboardingGate allow="ready" />}>
                    <Route path={routes.checkout} element={<CheckoutPage />} />
                    <Route path={routes.account} element={<AccountPage />} />
                    <Route path={routes.notifications} element={<NotificationsPage />} />
                    <Route path={routes.favorites} element={<FavoritesPage />} />
                    <Route path={routes.myCollections} element={<MyCollectionsPage />} />
                    <Route path={routes.myCollection} element={<MyCollectionPage />} />
                    <Route path={routes.downloads} element={<DownloadsPage />} />
                    <Route path={routes.aiHistory} element={<AiHistoryPage />} />
                    <Route path={routes.team} element={<TeamPage />} />
                  </Route>

                  <Route path={routes.notFound} element={<NotFoundPage />} />
                </Route>
              </Routes>
            </AppErrorBoundary>
          </HashRouter>
        </CookieConsentProvider>
      </SessionProvider>
    </LocaleProvider>
  </AppearanceProvider>
);
