import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { applyTheme, buildTheme, defaultLocale, isLocale, type Locale } from '@/shared/theme';
import { storageKeys, texts } from '@/shared/constants';
import { LocaleContext, useAppearance, useStoredValue } from '@/shared/hooks';
import { convertPrice, formatPrice, preferences, storage } from '@/shared/utils';

const savedLocale = (): Locale => {
  const saved = storage.get(storageKeys.locale);
  return isLocale(saved) ? saved : defaultLocale;
};

// Holds the active language and currency, and applies the language's theme (CSS variables, lang, dir) before each paint.
// The theme also follows the user's appearance choice (light / dark mode and accent color).
export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(savedLocale);
  const [currency, setCurrency] = useStoredValue(preferences.currency);
  const { mode, accent } = useAppearance();
  const theme = useMemo(() => buildTheme({ locale, mode, accent }), [locale, mode, accent]);
  const text = texts[locale];

  useLayoutEffect(() => {
    applyTheme(theme);
    document.title = text.meta.title;
    storage.set(storageKeys.locale, locale);
  }, [locale, theme, text]);

  // Picking a language is a choice we remember: the language suggestion isn't shown again.
  const setLocale = useCallback((next: Locale) => {
    preferences.localeChosen.set(true);
    setLocaleState(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      theme,
      text,
      setLocale,
      currency,
      setCurrency,
      price: (amount: number) => formatPrice(convertPrice(amount, currency), locale, currency),
    }),
    [locale, theme, text, setLocale, currency, setCurrency],
  );

  return <LocaleContext value={value}>{children}</LocaleContext>;
};
