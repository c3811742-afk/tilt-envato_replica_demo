import { useState } from 'react';
import { Button, Checkbox, Modal, Stack, Text } from '@/shared/components';
import { cookieCategories, type OptionalCookieCategory } from '@/shared/constants';
import { useCookieConsent, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { allOptionalCookies } from '@/shared/utils';

// Opened from the banner's "Customize" or the footer's "Cookie settings".
export const CookieSettingsDialog = () => {
  const { settingsOpen } = useCookieConsent();
  // Mounted only while open, so it always starts from the saved choice.
  return settingsOpen ? <CookieSettingsContent /> : null;
};

// Lets the user turn each optional cookie group on or off. Necessary cookies are always on.
const CookieSettingsContent = () => {
  const { text } = useLocale();
  const { consent, save, closeSettings } = useCookieConsent();
  // Starts from the saved choice; with no choice yet, every optional group starts off.
  const [choices, setChoices] = useState<Record<OptionalCookieCategory, boolean>>(() => consent ?? allOptionalCookies(false));

  return (
    <Modal
      open
      onClose={closeSettings}
      title={text.cookies.settingsTitle}
      actions={
        <>
          <Button variant="outline" onClick={() => save(choices)}>
            {text.cookies.save}
          </Button>
          <Button onClick={() => save(allOptionalCookies(true))}>{text.cookies.acceptAll}</Button>
        </>
      }
    >
      <Text color={vars.colors.textMuted}>{text.cookies.settingsMessage}</Text>
      {cookieCategories.map((category) => (
        <Checkbox
          key={category}
          checked={category === 'necessary' || choices[category]}
          disabled={category === 'necessary'}
          onChange={(checked) => category !== 'necessary' && setChoices((current) => ({ ...current, [category]: checked }))}
          label={
            <Stack gap={vars.spacing[1]}>
              <Text as="span" variant="title">
                {text.cookies.categories[category].title}
              </Text>
              <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                {text.cookies.categories[category].text}
              </Text>
            </Stack>
          }
        />
      ))}
    </Modal>
  );
};
