import { defaultBrowsePreferences, gridSizes, pagingModes, resultViews, storageKeys } from '@/shared/constants';
import { suggestCurrency, isDisplayCurrency } from './region';
import { isOneOf } from './search';
import { createStoredValue } from './storedValue';

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isVolume = (value: unknown): value is number => typeof value === 'number' && value >= 0 && value <= 1;

// Settings the visitor picks while browsing, remembered on this device. Read them with useStoredValue.
export const preferences = {
  gridSize: createStoredValue(storageKeys.gridSize, (value) => isOneOf(value, gridSizes), () => defaultBrowsePreferences.gridSize),
  pagingMode: createStoredValue(storageKeys.pagingMode, (value) => isOneOf(value, pagingModes), () => defaultBrowsePreferences.pagingMode),
  fontView: createStoredValue(storageKeys.fontView, (value) => isOneOf(value, resultViews), () => defaultBrowsePreferences.fontView),
  volume: createStoredValue(storageKeys.volume, isVolume, () => defaultBrowsePreferences.volume),
  currency: createStoredValue(storageKeys.currency, isDisplayCurrency, suggestCurrency),
  filtersCollapsed: createStoredValue(storageKeys.filtersCollapsed, isBoolean, () => false),
  localeChosen: createStoredValue(storageKeys.localeChosen, isBoolean, () => false),
  languageSuggestionDismissed: createStoredValue(storageKeys.languageSuggestionDismissed, isBoolean, () => false),
};
