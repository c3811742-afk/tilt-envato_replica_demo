import type { ReactNode } from 'react';
import { Page } from '@/shared/components';
import { vars } from '@/shared/theme';

interface AuthPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// The narrow, centered page every onboarding form uses (sign in, sign up, verify, reset, profile).
export const AuthPage = ({ title, subtitle, children }: AuthPageProps) => (
  <Page title={title} subtitle={subtitle} contentMaxWidth={vars.sizes.authForm.maxWidth} gap={vars.spacing[5]} centered>
    {children}
  </Page>
);
