import { createContext, useContext } from 'react';
import type { Locale, Theme } from '@/shared/theme';
import type { DisplayCurrency, Text } from '@/shared/constants';

export interface LocaleContextValue {
  locale: Locale; // English or Arabic: the layout, fonts and formatting (a language the team added uses one of them)
  language: string; // the chosen language's code: 'en', 'ar' or one the team added, e.g. 'fr'
  theme: Theme;
  text: Text;
  setLocale: (locale: Locale) => void; // the user's own choice: no more language suggestions after it
  setLanguage: (code: string) => void; // the same, for any language in the language menu
  currency: DisplayCurrency; // prices are shown in this currency
  setCurrency: (currency: DisplayCurrency) => void;
  price: (amount: number) => string; // an amount in Egyptian pounds, shown in the user's currency
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

// The active language, its theme and its UI text.
export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside <LocaleProvider>');
  return context;
};
