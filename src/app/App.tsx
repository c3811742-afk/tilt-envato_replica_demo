import { HashRouter, Route, Routes } from 'react-router';
import { routes } from '@/shared/constants';
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
import { SavedPage } from '@/features/customer/pages/SavedPage';
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
                  <Route element={<OnboardingGate allow="ready" />}>
                    <Route path={routes.checkout} element={<CheckoutPage />} />
                    <Route path={routes.account} element={<AccountPage />} />
                    <Route path={routes.notifications} element={<NotificationsPage />} />
                    <Route path={routes.saved} element={<SavedPage />} />
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
