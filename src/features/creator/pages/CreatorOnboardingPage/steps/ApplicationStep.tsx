import { ChipGroup, FieldMessage, Grid, Stack, Text, TextField } from '@/shared/components';
import { categoryIcons, creatorApplication } from '@/shared/constants';
import { vars } from '@/shared/theme';
import { categoryIds } from '@/shared/types';
import { UploadCard } from '@/features/creator/components';
import type { OnboardingStepProps } from '../onboardingModel';
import { useStepText } from './useStepText';

export const ApplicationStep = ({ values, errors, update }: OnboardingStepProps) => {
  const { text, t, errorFor } = useStepText(errors);

  return (
    <Stack gap={vars.spacing[5]}>
      <ChipGroup
        multiple
        label={t.application.specialtiesLabel}
        hint={t.application.specialtiesHint}
        error={errorFor('specialties')}
        options={categoryIds.map((id) => ({
          value: id,
          label: text.categories[id].name,
          icon: categoryIcons[id],
        }))}
        value={values.specialties}
        onChange={(specialties) => update('specialties', specialties)}
      />
      <Grid columns={2} gap={vars.spacing[5]}>
        <Stack gap={vars.spacing[5]}>
          <TextField
            direction="ltr"
            type="text"
            inputMode="text"
            autoComplete="url"
            label={t.application.portfolioUrlLabel}
            hint={t.application.portfolioUrlHint}
            placeholder={t.application.portfolioUrlPlaceholder}
            value={values.portfolioUrl}
            onChange={(url) => update('portfolioUrl', url)}
            error={errorFor('portfolioUrl')}
          />
          <TextField
            rows={5}
            label={t.application.aboutLabel}
            hint={t.application.aboutHint}
            value={values.about}
            onChange={(about) => update('about', about)}
            error={errorFor('about')}
          />
        </Stack>
        {/* Laid out like a text field: label above, hint below, so the box lines up with the fields beside it. */}
        <Stack gap={vars.spacing[2]}>
          <Text as="span" variant="title">
            {`${t.application.portfolioFileLabel} (${t.optional})`}
          </Text>
          <Stack grow>
            <UploadCard accept={creatorApplication.samplesAccept} value={values.samples} onChange={(file) => update('samples', file)} />
          </Stack>
          <FieldMessage tone="hint" message={t.application.portfolioFileHint} />
        </Stack>
      </Grid>
    </Stack>
  );
};
