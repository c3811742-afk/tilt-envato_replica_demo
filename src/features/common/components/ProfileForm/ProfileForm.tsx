import { ChipGroup, FormFooter, PhoneField, Stack, TextField } from '@/shared/components';
import { categoryIcons, notificationChannels, useCases, type NotificationChannel, type UseCase } from '@/shared/constants';
import { useForm, useLocale, useMessages, useStoredValue } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { CategoryId, NotificationSettings, User, UserProfile } from '@/shared/types';
import { categorySettingsStore, normalizeEgyptianMobile, shownCategoryIds, validateEgyptianMobile, validateRequired } from '@/shared/utils';

type ProfileValues = {
  fullName: string;
  arabicName: string;
  phone: string;
  useCase: UseCase | '';
  interests: CategoryId[];
  channels: NotificationChannel[];
};

interface ProfileFormProps {
  user: User;
  submitLabel: string;
  showChannels: boolean; // asked during onboarding; changed later in the notification settings
  onSubmit: (profile: UserProfile, notifications: NotificationSettings) => Promise<void>;
}

// The user's profile: name (and Arabic name), phone, what they'll use the site for, interests, student ID.
// Used right after sign-up ("Gather user information") and in the account settings ("Edit profile").
export const ProfileForm = ({ user, submitLabel, showChannels, onSubmit }: ProfileFormProps) => {
  const { text } = useLocale();
  useStoredValue(categorySettingsStore); // shows the team's category order and hides hidden ones as they change
  const { fieldError } = useMessages();
  const profile = user.profile;
  // Google, Apple and Facebook share the user's real name; an email sign-up's name is only its email prefix.
  const knownName = profile?.fullName ?? (user.linkedProviders.length ? user.name : '');

  const form = useForm<ProfileValues>(
    {
      fullName: knownName,
      arabicName: profile?.arabicName ?? '',
      phone: profile?.phone ?? '',
      useCase: profile?.useCase ?? '',
      interests: profile?.interests ?? [],
      channels: notificationChannels.filter((channel) => user.notifications.channels[channel]),
    },
    {
      fullName: validateRequired,
      phone: validateEgyptianMobile,
      useCase: (useCase) => (useCase ? null : 'required'),
      interests: (interests) => (interests.length ? null : 'chooseAtLeastOne'),
      channels: (channels) => (showChannels && !channels.length ? 'chooseAtLeastOne' : null),
    },
  );

  const submit = form.submit(async ({ fullName, arabicName, phone, useCase, interests, channels }) => {
    if (!useCase) return; // already checked by the form
    await onSubmit(
      {
        fullName: fullName.trim(),
        arabicName: arabicName.trim() || undefined,
        phone: normalizeEgyptianMobile(phone),
        useCase,
        interests,
      },
      {
        ...user.notifications,
        channels: Object.fromEntries(notificationChannels.map((channel) => [channel, channels.includes(channel)])) as Record<
          NotificationChannel,
          boolean
        >,
      },
    );
  });

  return (
    <Stack as="form" gap={vars.spacing[5]} onSubmit={submit} noValidate>
      <TextField label={text.profile.fullName} autoComplete="name" {...form.field('fullName')} />
      <TextField label={text.profile.arabicName} hint={text.profile.arabicNameHint} direction="auto" {...form.field('arabicName')} />
      <PhoneField {...form.field('phone')} />
      <ChipGroup<UseCase>
        label={text.profile.useCase}
        options={useCases.map((useCase) => ({ value: useCase, label: text.profile.useCases[useCase] }))}
        value={form.values.useCase ? [form.values.useCase] : []}
        onChange={([useCase]) => form.setValue('useCase', useCase ?? '')}
        error={fieldError(form.errors.useCase)}
      />
      <ChipGroup<CategoryId>
        label={text.profile.interests}
        multiple
        options={shownCategoryIds(form.values.interests).map((id) => ({ value: id, label: text.categories[id].name, icon: categoryIcons[id] }))}
        value={form.values.interests}
        onChange={(interests) => form.setValue('interests', interests)}
        hint={text.profile.interestsHint}
        error={fieldError(form.errors.interests)}
      />
      {showChannels && (
        <ChipGroup<NotificationChannel>
          label={text.profile.notifyBy}
          multiple
          options={notificationChannels.map((channel) => ({ value: channel, label: text.profile.channels[channel] }))}
          value={form.values.channels}
          onChange={(channels) => form.setValue('channels', channels)}
          hint={text.profile.channelsHint}
          error={fieldError(form.errors.channels)}
        />
      )}
      <FormFooter label={submitLabel} submitting={form.submitting} requestError={form.requestError} />
    </Stack>
  );
};
