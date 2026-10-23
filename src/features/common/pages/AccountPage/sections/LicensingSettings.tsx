import { useState } from 'react';
import { OptionCardGroup, Stack, TextField } from '@/shared/components';
import { licensingPreferences, type LicensingPreference } from '@/shared/constants';
import { useForm, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { LicensingSettings as Settings } from '@/shared/types';
import { authApi, validateProjectName } from '@/shared/utils';
import { SettingsForm } from '../SettingsForm';
import { useSignedInUser } from '../useSignedInUser';
import { YoutubeChannels } from './YoutubeChannels';

// "Set my licensing preference: always ask, never ask, or remember my last choice", and the YouTube channels
// music licenses cover.
export const LicensingSettings = () => {
  const { text } = useLocale();
  const { setAccount } = useSession();
  const user = useSignedInUser();
  const [saved, setSaved] = useState(false);
  const form = useForm<Settings>(user.licensing, {
    // "Never ask" licenses downloads for the default project, so it needs one.
    defaultProjectName: (name, values) => (values.preference === 'neverAsk' && validateProjectName(name) ? 'required' : null),
  });

  return (
    <Stack gap={vars.spacing[8]}>
      <SettingsForm
        title={text.account.licensing.title}
        saved={saved}
        submitting={form.submitting}
        requestError={form.requestError}
        onSubmit={form.submit(async (values) => {
          setAccount(await authApi.updateLicensing({ ...values, defaultProjectName: values.defaultProjectName.trim() }));
          setSaved(true);
        })}
      >
        <OptionCardGroup<LicensingPreference>
          label={text.account.licensing.title}
          value={form.values.preference}
          onChange={(preference) => form.setValue('preference', preference)}
          options={licensingPreferences.map((preference) => ({
            value: preference,
            title: text.account.licensing.options[preference].title,
            description: text.account.licensing.options[preference].text,
          }))}
        />
        <TextField
          label={text.account.licensing.defaultProject}
          hint={text.account.licensing.defaultProjectHint}
          placeholder={text.license.projectPlaceholder}
          direction="auto"
          {...form.field('defaultProjectName')}
        />
      </SettingsForm>
      <YoutubeChannels channels={user.youtubeChannels} />
    </Stack>
  );
};
