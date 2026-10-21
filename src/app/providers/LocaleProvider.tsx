import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { applyTheme, defaultLocale, isLocale, nextLocale, themes, type Locale } from '@/shared/theme';
import { storageKeys, texts } from '@/shared/constants';
import { LocaleContext } from '@/shared/hooks';
import { storage } from '@/shared/utils';

const savedLocale = (): Locale => {
  const saved = storage.get(storageKeys.locale);
  return isLocale(saved) ? saved : defaultLocale;
};

// Holds the active language and applies its theme (CSS variables, lang, dir) before each paint.
export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>(savedLocale);
  const theme = themes[locale];
  const text = texts[locale];

  useLayoutEffect(() => {
    applyTheme(theme);
    document.title = text.meta.title;
    storage.set(storageKeys.locale, locale);
  }, [locale, theme, text]);

  const switchLocale = useCallback(() => setLocale(nextLocale), []);

  const value = useMemo(
    () => ({ locale, theme, text, setLocale, switchLocale }),
    [locale, theme, text, switchLocale],
  );

  return <LocaleContext value={value}>{children}</LocaleContext>;
};
