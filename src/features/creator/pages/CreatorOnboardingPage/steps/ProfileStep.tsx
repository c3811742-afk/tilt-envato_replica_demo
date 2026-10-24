import { Avatar, Card, Grid, Stack, Text, TextField } from '@/shared/components';
import { creatorApplication } from '@/shared/constants';
import { vars } from '@/shared/theme';
import { UploadCard } from '@/features/creator/components';
import type { OnboardingStepProps } from '../onboardingModel';
import { useStepText } from './useStepText';

export const ProfileStep = ({ values, errors, update }: OnboardingStepProps) => {
  const { t, errorFor } = useStepText(errors);
  const name = values.displayName.trim() || t.profile.previewName;

  return (
    <Grid columns={2} gap={vars.spacing[6]}>
      <Stack gap={vars.spacing[5]}>
        <TextField
          autoComplete="nickname"
          label={t.profile.displayNameLabel}
          value={values.displayName}
          onChange={(displayName) => update('displayName', displayName)}
          error={errorFor('displayName')}
        />
        <TextField
          direction="ltr"
          prefix="@"
          autoComplete="username"
          label={t.profile.usernameLabel}
          hint={t.profile.usernameHint}
          value={values.username}
          onChange={(username) => update('username', username.toLowerCase())}
          error={errorFor('username')}
        />
        <TextField
          rows={4}
          maxLength={creatorApplication.bioMaxLength}
          label={`${t.profile.bioLabel} (${t.optional})`}
          hint={t.profile.bioHint}
          value={values.bio}
          onChange={(bio) => update('bio', bio)}
          error={errorFor('bio')}
        />
      </Stack>

      <Stack gap={vars.spacing[5]}>
        {/* How customers will see the profile, updated as the user types. */}
        <Stack gap={vars.spacing[2]}>
          <Text variant="label" color={vars.colors.textMuted}>
            {t.profile.previewLabel}
          </Text>
          <Card background={vars.colors.surfaceMuted} borderColor={vars.colors.borderMuted}>
            <Stack direction="row" align="center" gap={vars.spacing[4]}>
              <Avatar name={name} size="xl" />
              <Stack gap={vars.spacing[1]}>
                <Text as="span" variant="h3" autoDirection>
                  {name}
                </Text>
                {values.username && (
                  <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                    @{values.username}
                  </Text>
                )}
                <Text variant="bodySm" color={values.bio ? vars.colors.text : vars.colors.textMuted} autoDirection maxLines={2}>
                  {values.bio || t.profile.previewBio}
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Stack>
        <UploadCard
          label={`${t.profile.avatarLabel} (${t.optional})`}
          hint={t.profile.avatarHint}
          accept={creatorApplication.avatarAccept}
          value={values.avatar}
          onChange={(file) => update('avatar', file)}
        />
      </Stack>
    </Grid>
  );
};
