import { Divider, Dropdown, Icon, Select, Stack, Text } from '@/shared/components';
import { displayCurrencyCodes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { locales, vars, type Locale } from '@/shared/theme';
import { fillText, formatCurrencyName, isDisplayCurrency } from '@/shared/utils';
import styles from './LanguageMenu.module.css';

const localeList = Object.keys(locales) as Locale[];

// "A guest can choose the site's language from a language list", and the currency prices are shown in.
export const LanguageMenu = () => {
  const { text, locale, setLocale, currency, setCurrency } = useLocale();

  return (
    <Dropdown
      label={text.languageMenu.label}
      trigger={
        <>
          <Icon name="globe" size={vars.sizes.icon.sm} />
          {/* Phones show the globe only, so the signed-in actions fit beside the logo. */}
          <span className={styles.wideOnly} lang={locale}>
            {text.languageNames[locale]}
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
              {localeList.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={option === locale}
                    lang={option}
                    className={styles.language}
                    onClick={() => {
                      setLocale(option);
                      close();
                    }}
                  >
                    {text.languageNames[option]}
                    {option === locale && <Icon name="check" size={vars.sizes.icon.sm} />}
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
