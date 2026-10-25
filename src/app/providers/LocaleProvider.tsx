import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { applyTheme, buildTheme, defaultLocale, isLocale, type Locale } from '@/shared/theme';
import { storageKeys, texts } from '@/shared/constants';
import { LocaleContext, useAppearance, useStoredValue } from '@/shared/hooks';
import { addedLanguagesStore, convertPrice, formatPrice, hiddenLocalesStore, preferences, siteLanguageOptions, storage, textEditStore, withTextEdits } from '@/shared/utils';

const savedLocale = (): Locale => {
  const saved = storage.get(storageKeys.locale);
  return isLocale(saved) ? saved : defaultLocale;
};

// The chosen language: English or Arabic, or one the team added (checked against the shown ones on each render).
const savedLanguage = () => storage.get(storageKeys.language) ?? savedLocale();

// Holds the active language and currency, and applies the language's theme (CSS variables, lang, dir) before each paint.
// The theme also follows the user's appearance choice (light / dark mode and accent color).
// A language the team added uses the English or Arabic layout (by its direction), and that language's texts and content
// where it isn't translated, so the page never mixes two fallbacks.
export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(savedLanguage);
  const [addedLanguages] = useStoredValue(addedLanguagesStore);
  const [hiddenLocales] = useStoredValue(hiddenLocalesStore);
  const options = siteLanguageOptions(hiddenLocales, addedLanguages);
  // A language the team hid since falls back to the last English or Arabic used, or the first language still shown.
  const active = options.find((option) => option.code === language) ??
    options.find((option) => option.code === savedLocale()) ??
    options[0] ?? { code: defaultLocale, locale: defaultLocale };
  const { added, locale } = active;
  const languageCode = active.code;
  const [currency, setCurrency] = useStoredValue(preferences.currency);
  const { mode, accent } = useAppearance();
  const theme = useMemo(() => buildTheme({ locale, mode, accent }), [locale, mode, accent]);
  const [textEdits] = useStoredValue(textEditStore);
  // The site's text with the team's corrections from the admin (translations, category names).
  const text = useMemo(
    () => withTextEdits(texts[locale], added ? { ...textEdits[locale], ...textEdits[added.code] } : textEdits[locale]),
    [added, locale, textEdits],
  );

  useLayoutEffect(() => {
    applyTheme(theme);
    document.documentElement.lang = languageCode;
    document.title = text.meta.title;
    storage.set(storageKeys.locale, locale);
    storage.set(storageKeys.language, languageCode);
  }, [locale, languageCode, theme, text]);

  // Picking a language is a choice we remember: the language suggestion isn't shown again.
  const setLanguage = useCallback((next: string) => {
    preferences.localeChosen.set(true);
    if (isLocale(next)) storage.set(storageKeys.locale, next);
    setLanguageState(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      language: languageCode,
      theme,
      text,
      setLocale: setLanguage,
      setLanguage,
      currency,
      setCurrency,
      price: (amount: number) => formatPrice(convertPrice(amount, currency), locale, currency),
    }),
    [locale, languageCode, theme, text, setLanguage, currency, setCurrency],
  );

  return <LocaleContext value={value}>{children}</LocaleContext>;
};
