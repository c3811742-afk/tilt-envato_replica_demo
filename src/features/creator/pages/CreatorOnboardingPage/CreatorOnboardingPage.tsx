import { useState, type FormEvent } from 'react';
import { Button, Card, FieldMessage, Icon, Page, SectionHeader, Stack, Stepper, Text } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { creatorApi, fillText, formatNumber, safeAsync } from '@/shared/utils';
import { hasErrors, normalizeApplication, onboardingSteps, validateStep, type OnboardingErrors } from './onboardingModel';
import { OnboardingSubmitted } from './OnboardingSubmitted';
import { AgreementStep, ApplicationStep, IdentityStep, PayoutStep, ProfileStep } from './steps';
import { useOnboardingDraft } from './useOnboardingDraft';

const stepComponents = {
  application: ApplicationStep,
  agreement: AgreementStep,
  identity: IdentityStep,
  payout: PayoutStep,
  profile: ProfileStep,
} as const;

// "Become a creator": a five-step application, saved as the user goes, then a live status page.
export const CreatorOnboardingPage = () => {
  const { text, locale } = useLocale();
  const t = text.creatorOnboarding;
  const { draft, setDraft, resetDraft } = useOnboardingDraft();
  const [errors, setErrors] = useState<OnboardingErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  const { stepIndex, values, receipt } = draft;
  const step = onboardingSteps[stepIndex];
  const isLast = stepIndex === onboardingSteps.length - 1;
  const StepFields = stepComponents[step];
  const stepOf = fillText(t.stepOf, {
    current: formatNumber(stepIndex + 1, locale),
    total: formatNumber(onboardingSteps.length, locale),
  });

  const goTo = (index: number) => {
    setErrors({});
    setDraft((current) => ({ ...current, stepIndex: index }));
    window.scrollTo({ top: 0 });
  };

  const update: Parameters<typeof StepFields>[0]['update'] = (field, value) => {
    setDraft((current) => ({
      ...current,
      values: { ...current.values, [field]: value },
    }));
    // A field that shows an error is checked again as the user fixes it.
    if (errors[field])
      setErrors((current) => ({
        ...current,
        [field]: validateStep(step, { ...values, [field]: value })[field],
      }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const stepErrors = validateStep(step, values);
    setErrors(stepErrors);
    if (hasErrors(stepErrors)) return;
    if (!isLast) {
      goTo(stepIndex + 1);
      return;
    }
    setSubmitting(true);
    setSubmitFailed(false);
    const result = await safeAsync(() => creatorApi.submitApplication(normalizeApplication(values)));
    setSubmitting(false);
    if (result.ok) {
      setDraft((current) => ({ ...current, receipt: result.data }));
      window.scrollTo({ top: 0 });
    } else setSubmitFailed(true);
  };

  if (receipt) {
    return (
      <Page title={t.submitted.title} subtitle={t.submitted.message}>
        <OnboardingSubmitted receipt={receipt} onStartOver={resetDraft} />
      </Page>
    );
  }

  return (
    <Page title={t.title} subtitle={t.subtitle}>
      <Card padding={vars.spacing[6]} gap={vars.spacing[6]}>
        <Stepper label={t.stepsLabel} steps={onboardingSteps.map((name) => ({ label: t.steps[name] }))} current={stepIndex} />

        <Stack as="form" gap={vars.spacing[6]} onSubmit={(event) => void submit(event)} noValidate>
          <Stack gap={vars.spacing[2]}>
            <Text variant="label" color={vars.colors.primary}>
              {stepOf}
            </Text>
            <SectionHeader as="h2" variant="h3" title={t[step].heading} subtitle={t[step].description} />
          </Stack>

          <StepFields values={values} errors={errors} update={update} />

          <Stack gap={vars.spacing[3]}>
            <FieldMessage tone="error" message={hasErrors(errors) ? t.fixErrors : submitFailed ? t.submitError : undefined} />
            <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[3]}>
              <Stack direction="row" wrap align="center" gap={vars.spacing[3]}>
                <Button variant="outline" to={routes.home}>
                  <Icon name="home" size={vars.sizes.icon.sm} />
                  {text.common.backToHome}
                </Button>
                <Text variant="bodySm" color={vars.colors.textMuted}>
                  {t.savedNote}
                </Text>
              </Stack>
              <Stack direction="row" gap={vars.spacing[3]}>
                {stepIndex > 0 && (
                  <Button variant="outline" onClick={() => goTo(stepIndex - 1)}>
                    <Icon name="chevronStart" size={vars.sizes.icon.sm} />
                    {text.common.back}
                  </Button>
                )}
                <Button type="submit" disabled={submitting}>
                  {submitting ? t.submitting : isLast ? t.submit : text.common.continue}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Page>
  );
};
