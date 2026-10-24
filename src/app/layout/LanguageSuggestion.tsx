import { useState } from 'react';
import { Button, Container, Stack, Text } from '@/shared/components';
import { texts } from '@/shared/constants';
import { useLocale, useStoredValue } from '@/shared/hooks';
import { locales, vars } from '@/shared/theme';
import { preferences, suggestLocale } from '@/shared/utils';
import styles from './LanguageSuggestion.module.css';

// "The site suggests a language based on the guest's browser or country": offered once, in that language,
// until the visitor picks a language themselves or says "Not now".
export const LanguageSuggestion = () => {
  const { locale, setLocale } = useLocale();
  const [chosen] = useStoredValue(preferences.localeChosen);
  const [dismissed, setDismissed] = useStoredValue(preferences.languageSuggestionDismissed);
  const [suggested] = useState(suggestLocale);
  if (chosen || dismissed || suggested === locale) return null;

  const copy = texts[suggested].languageSuggestion;
  return (
    <aside className={styles.bar} lang={locales[suggested].lang} dir={locales[suggested].dir}>
      <Container>
        <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[3]}>
          <Text variant="bodySm">{copy.message}</Text>
          <Stack direction="row" wrap gap={vars.spacing[2]}>
            <Button variant="outline" size="sm" onClick={() => setDismissed(true)}>
              {copy.dismiss}
            </Button>
            <Button size="sm" onClick={() => setLocale(suggested)}>
              {copy.switch}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </aside>
  );
};
