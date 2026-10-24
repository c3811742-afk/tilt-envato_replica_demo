import { Button, Container, Stack, Text } from '@/shared/components';
import { useCookieConsent, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { allOptionalCookies } from '@/shared/utils';
import styles from './CookieBanner.module.css';

// "A guest can choose their cookie preference": asked once, until the user makes a choice.
export const CookieBanner = () => {
  const { text } = useLocale();
  const { consent, settingsOpen, save, openSettings } = useCookieConsent();
  if (consent || settingsOpen) return null;

  return (
    <section className={styles.banner} aria-label={text.cookies.title}>
      <Container>
        <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[4]}>
          <Stack gap={vars.spacing[1]}>
            <Text as="h2" variant="title">
              {text.cookies.title}
            </Text>
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {text.cookies.message}
            </Text>
          </Stack>
          <Stack direction="row" wrap gap={vars.spacing[2]}>
            <Button variant="outline" size="sm" onClick={openSettings}>
              {text.cookies.customize}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => save(allOptionalCookies(false))}>
              {text.cookies.rejectAll}
            </Button>
            <Button size="sm" onClick={() => save(allOptionalCookies(true))}>
              {text.cookies.acceptAll}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </section>
  );
};
