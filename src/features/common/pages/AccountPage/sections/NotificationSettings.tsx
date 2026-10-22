import { useState } from 'react';
import { Card, Checkbox, SegmentedControl, Stack, Text } from '@/shared/components';
import { notificationChannels, notificationTopics, phoneCountryCode, texts } from '@/shared/constants';
import { useForm, useLocale, useMessages, useSession } from '@/shared/hooks';
import { locales, vars, type Locale } from '@/shared/theme';
import type { NotificationSettings as Settings } from '@/shared/types';
import { authApi, fillText } from '@/shared/utils';
import { SettingsForm } from '../SettingsForm';
import { useSignedInUser } from '../useSignedInUser';

const localeList = Object.keys(locales) as Locale[];

// "Choose how to get notifications", "edit notification preferences" and "notifications in my language".
export const NotificationSettings = () => {
  const { text } = useLocale();
  const { fieldError } = useMessages();
  const { setAccount } = useSession();
  const user = useSignedInUser();
  const [saved, setSaved] = useState(false);
  const form = useForm<Settings>(user.notifications, {
    channels: (channels) => (Object.values(channels).some(Boolean) ? null : 'chooseAtLeastOne'),
  });
  const phone = `${phoneCountryCode} ${(user.profile?.phone ?? '').replace(/^0/, '')}`;
  const preview = texts[form.values.language].emailPreview;
  const firstDownload = user.downloads[0]?.itemTitle ?? text.notifications.title;

  return (
    <SettingsForm
      title={text.account.sections.notifications}
      saved={saved}
      submitting={form.submitting}
      requestError={form.requestError}
      onSubmit={form.submit(async (values) => {
        setAccount(await authApi.updateNotifications(values));
        setSaved(true);
      })}
    >
      <Stack gap={vars.spacing[2]}>
        <Text as="h4" variant="title">
          {text.account.notifications.channelsTitle}
        </Text>
        {notificationChannels.map((channel) => (
          <Checkbox
            key={channel}
            label={text.profile.channels[channel]}
            checked={form.values.channels[channel]}
            onChange={(checked) => form.setValue('channels', (current) => ({ ...current, [channel]: checked }))}
          />
        ))}
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {form.values.channels.whatsapp ? `${fillText(text.account.notifications.whatsappTo, { phone })} ` : ''}
          {text.account.notifications.securityNote}
        </Text>
        {fieldError(form.errors.channels) && (
          <Text variant="bodySm" color={vars.colors.danger}>
            {fieldError(form.errors.channels)}
          </Text>
        )}
      </Stack>

      <Stack gap={vars.spacing[2]}>
        <Text as="h4" variant="title">
          {text.account.notifications.topicsTitle}
        </Text>
        {notificationTopics.map((topic) => (
          <Checkbox
            key={topic}
            checked={form.values.topics[topic]}
            onChange={(checked) => form.setValue('topics', (current) => ({ ...current, [topic]: checked }))}
            label={
              <Stack gap={vars.spacing[1]}>
                <Text as="span" variant="title">
                  {text.account.notifications.topics[topic].title}
                </Text>
                <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                  {text.account.notifications.topics[topic].text}
                </Text>
              </Stack>
            }
          />
        ))}
      </Stack>

      <Stack gap={vars.spacing[2]}>
        <Text as="h4" variant="title">
          {text.account.notifications.languageTitle}
        </Text>
        <div>
          <SegmentedControl<Locale>
            label={text.account.notifications.languageTitle}
            value={form.values.language}
            onChange={(language) => form.setValue('language', language)}
            options={localeList.map((locale) => ({ value: locale, label: text.languageNames[locale] }))}
          />
        </div>
      </Stack>

      {/* The sample email is written in the language picked above, whatever language the site is in. */}
      <Stack gap={vars.spacing[2]}>
        <Text as="h4" variant="title">
          {text.account.notifications.previewTitle}
        </Text>
        <div lang={locales[form.values.language].lang} dir={locales[form.values.language].dir}>
          <Card background={vars.colors.surfaceMuted} borderColor={vars.colors.borderMuted} gap={vars.spacing[2]}>
            <Text variant="title">{preview.subject}</Text>
            <Text variant="bodySm">{fillText(preview.greeting, { name: user.name })}</Text>
            <Text variant="bodySm">{fillText(preview.body, { item: firstDownload })}</Text>
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {preview.footer}
            </Text>
          </Card>
        </div>
      </Stack>
    </SettingsForm>
  );
};
