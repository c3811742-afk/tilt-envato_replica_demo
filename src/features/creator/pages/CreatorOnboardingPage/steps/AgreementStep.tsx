import { Card, Checkbox, Stack, Text } from '@/shared/components';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';
import type { OnboardingStepProps } from '../onboardingModel';
import { useStepText } from './useStepText';

export const AgreementStep = ({ values, errors, update }: OnboardingStepProps) => {
  const { t, locale, errorFor } = useStepText(errors);
  const terms = Object.values(t.agreement.terms);

  return (
    <Stack gap={vars.spacing[5]}>
      <Card background={vars.colors.surfaceMuted} borderColor={vars.colors.borderMuted}>
        <Stack as="ol" gap={vars.spacing[3]}>
          {terms.map((term, index) => (
            <Stack as="li" key={term} direction="row" gap={vars.spacing[3]}>
              <Text as="span" variant="label" color={vars.colors.primary}>
                {formatNumber(index + 1, locale)}
              </Text>
              <Text as="span">{term}</Text>
            </Stack>
          ))}
        </Stack>
      </Card>
      <Stack gap={vars.spacing[3]}>
        <Checkbox
          label={t.agreement.acceptLabel}
          checked={values.acceptAgreement}
          onChange={(checked) => update('acceptAgreement', checked)}
          error={errorFor('acceptAgreement')}
        />
        <Checkbox
          label={t.agreement.ownershipLabel}
          checked={values.confirmOwnership}
          onChange={(checked) => update('confirmOwnership', checked)}
          error={errorFor('confirmOwnership')}
        />
      </Stack>
    </Stack>
  );
};
