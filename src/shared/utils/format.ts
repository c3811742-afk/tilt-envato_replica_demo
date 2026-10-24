import { locales, type Locale } from '@/shared/theme';
import { currency, displayCurrencies, type DisplayCurrency } from '@/shared/constants';

const intlTag = (locale: Locale) => locales[locale].intl;

export const formatNumber = (value: number, locale: Locale) => new Intl.NumberFormat(intlTag(locale)).format(value);

// 12500 -> "13K" / "13 ألف"
export const formatCompactNumber = (value: number, locale: Locale) =>
  new Intl.NumberFormat(intlTag(locale), { notation: 'compact' }).format(value);

// 0.25 -> "25%". Pass fractionDigits for small shares: 0.031 -> "3.1%".
export const formatPercent = (fraction: number, locale: Locale, fractionDigits = 0) =>
  new Intl.NumberFormat(intlTag(locale), { style: 'percent', maximumFractionDigits: fractionDigits }).format(fraction);

// "EGP 1,499" / "1,499 ج.م.", or another currency's amount: "$30.88".
export const formatPrice = (amount: number, locale: Locale, currencyCode: DisplayCurrency = currency.code) =>
  new Intl.NumberFormat(intlTag(locale), {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: displayCurrencies[currencyCode].fractionDigits,
  }).format(amount);

// A country's name in the active language: "EG" -> "Egypt" / "مصر".
export const formatCountry = (code: string, locale: Locale) =>
  new Intl.DisplayNames([intlTag(locale)], { type: 'region' }).of(code) ?? code;

// A language's name in the active language: "ar" -> "Arabic" / "العربية".
export const formatLanguageName = (code: string, locale: Locale) =>
  new Intl.DisplayNames([intlTag(locale)], { type: 'language' }).of(code) ?? code;

// A currency's name in the active language: "USD" -> "US Dollar" / "دولار أمريكي".
export const formatCurrencyName = (code: string, locale: Locale) =>
  new Intl.DisplayNames([intlTag(locale)], { type: 'currency' }).of(code) ?? code;

// A media length: 150 -> "2:30".
export const formatDuration = (seconds: number) => {
  const whole = Math.max(0, Math.round(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export const formatDate = (
  date: Date | string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
) => new Intl.DateTimeFormat(intlTag(locale), options).format(new Date(date));

const fileSizeUnits = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
const bytesPerUnit = 1024;

// 1536 -> "1.5 kB" / "1.5 كيلوبايت"
export const formatFileSize = (bytes: number, locale: Locale) => {
  const unitIndex = Math.min(
    Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(bytesPerUnit)),
    fileSizeUnits.length - 1,
  );
  return new Intl.NumberFormat(intlTag(locale), {
    style: 'unit',
    unit: fileSizeUnits[unitIndex],
    maximumFractionDigits: 1,
  }).format(bytes / bytesPerUnit ** unitIndex);
};
