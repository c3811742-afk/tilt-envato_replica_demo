import type { ReactNode } from 'react';
import { Page } from '@/shared/components';
import { vars } from '@/shared/theme';

interface AuthPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean; // off on the steps a new account must finish (verify, complete profile): Back would only return here
}

// The narrow, centered page every onboarding form uses (sign in, sign up, verify, reset, profile).
export const AuthPage = ({ title, subtitle, children, showBack = true }: AuthPageProps) => (
  <Page title={title} subtitle={subtitle} contentMaxWidth={vars.sizes.authForm.maxWidth} gap={vars.spacing[5]} centered showBack={showBack}>
    {children}
  </Page>
);
