import { useLocale } from '@/shared/hooks';
import type { OnboardingErrors } from '../onboardingModel';

// The onboarding text, and the message for a field's error (if it has one).
export const useStepText = (errors: OnboardingErrors) => {
  const { text, locale } = useLocale();
  const t = text.creatorOnboarding;
  const errorFor = (field: keyof OnboardingErrors) => {
    const key = errors[field];
    return key ? t.errors[key] : undefined;
  };
  return { text, t, locale, errorFor };
};
