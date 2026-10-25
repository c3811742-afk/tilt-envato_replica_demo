import { Grid, OptionCardGroup, Section, Stack, TextField } from '@/shared/components';
import { creatorApplication } from '@/shared/constants';
import { vars } from '@/shared/theme';
import type { IdType } from '@/shared/types';
import { UploadCard } from '@/features/creator/components';
import type { OnboardingStepProps } from '../onboardingModel';
import { useStepText } from './useStepText';

const idTypes: { value: IdType; icon: 'card' | 'globe' }[] = [
  { value: 'nationalId', icon: 'card' },
  { value: 'passport', icon: 'globe' },
];

export const IdentityStep = ({ values, errors, update }: OnboardingStepProps) => {
  const { t, errorFor } = useStepText(errors);
  const nationalId = values.idType === 'nationalId';

  return (
    <Stack gap={vars.spacing[5]}>
      <Section title={t.identity.idTypeLabel} variant="h3" gap={vars.spacing[3]}>
        <OptionCardGroup<IdType>
          label={t.identity.idTypeLabel}
          options={idTypes.map(({ value, icon }) => ({
            value,
            icon,
            title: t.identity.idTypes[value].label,
            description: t.identity.idTypes[value].description,
          }))}
          value={values.idType}
          onChange={(idType) => update('idType', idType)}
        />
      </Section>
      <Grid columns={2} gap={vars.spacing[4]}>
        <TextField
          autoComplete="name"
          label={t.identity.legalNameLabel}
          value={values.legalName}
          onChange={(name) => update('legalName', name)}
          error={errorFor('legalName')}
        />
        <TextField
          direction="ltr"
          inputMode={nationalId ? 'numeric' : 'text'}
          label={t.identity.idNumberLabel}
          value={values.idNumber}
          onChange={(idNumber) => update('idNumber', idNumber)}
          error={errorFor('idNumber')}
        />
      </Grid>
      <Grid columns={nationalId ? 2 : 1} gap={vars.spacing[4]}>
        <UploadCard
          label={nationalId ? t.identity.idFrontLabel : t.identity.passportPageLabel}
          hint={t.identity.idFileHint}
          accept={creatorApplication.idAccept}
          value={values.idFront}
          onChange={(file) => update('idFront', file)}
          error={errorFor('idFront')}
        />
        {nationalId && (
          <UploadCard
            label={t.identity.idBackLabel}
            hint={t.identity.idFileHint}
            accept={creatorApplication.idAccept}
            value={values.idBack}
            onChange={(file) => update('idBack', file)}
            error={errorFor('idBack')}
          />
        )}
      </Grid>
    </Stack>
  );
};
