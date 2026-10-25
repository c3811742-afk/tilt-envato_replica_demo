import { Divider, Dropdown, Icon, Select, Stack, Text } from '@/shared/components';
import { displayCurrencyCodes } from '@/shared/constants';
import { useLocale, useStoredValue } from '@/shared/hooks';
import { isLocale, vars } from '@/shared/theme';
import { addedLanguagesStore, fillText, formatCurrencyName, hiddenLocalesStore, isDisplayCurrency, siteLanguageOptions } from '@/shared/utils';
import styles from './LanguageMenu.module.css';

// "A guest can choose the site's language from a language list", and the currency prices are shown in.
// English and Arabic (unless the team hid one), then the languages the team added and published in the admin.
export const LanguageMenu = () => {
  const { text, locale, language, setLanguage, currency, setCurrency } = useLocale();
  const [addedLanguages] = useStoredValue(addedLanguagesStore);
  const [hiddenLocales] = useStoredValue(hiddenLocalesStore);
  const options = siteLanguageOptions(hiddenLocales, addedLanguages).map((option) => ({
    code: option.code,
    name: option.added ? option.added.nativeName : text.languageNames[option.locale],
  }));
  const current = isLocale(language) ? text.languageCodes[locale] : language.toUpperCase();

  return (
    <Dropdown
      label={text.languageMenu.label}
      trigger={
        <>
          <Icon name="globe" size={vars.sizes.icon.sm} />
          {/* The two-letter code, not the full name, to leave the search box room. Phones show the globe only. */}
          <span className={styles.wideOnly} lang="en">
            {current}
          </span>
        </>
      }
    >
      {(close) => (
        <Stack gap={vars.spacing[4]}>
          <Stack gap={vars.spacing[2]}>
            <Text variant="label" color={vars.colors.textMuted}>
              {text.languageMenu.language}
            </Text>
            <ul role="radiogroup" aria-label={text.languageMenu.language} className={styles.languages}>
              {options.map((option) => (
                <li key={option.code}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={option.code === language}
                    lang={option.code}
                    className={styles.language}
                    onClick={() => {
                      setLanguage(option.code);
                      close();
                    }}
                  >
                    {option.name}
                    {option.code === language && <Icon name="check" size={vars.sizes.icon.sm} />}
                  </button>
                </li>
              ))}
            </ul>
          </Stack>
          <Divider />
          <Stack gap={vars.spacing[2]}>
            <Select
              label={text.languageMenu.currency}
              value={currency}
              onChange={(value) => isDisplayCurrency(value) && setCurrency(value)}
              options={displayCurrencyCodes.map((code) => ({ value: code, label: fillText(text.languageMenu.currencyOption, { code, name: formatCurrencyName(code, locale) }) }))}
            />
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {text.languageMenu.currencyNote}
            </Text>
          </Stack>
        </Stack>
      )}
    </Dropdown>
  );
};
