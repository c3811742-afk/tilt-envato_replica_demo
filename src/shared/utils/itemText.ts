import type { Locale } from '@/shared/theme';
import type { Item } from '@/shared/types';

// The name the creator gave the item, in the language they wrote it in. Licenses and downloads keep this one.
export const originalTitle = (item: Pick<Item, 'title' | 'originalLanguage'>) => item.title[item.originalLanguage];

// True when the item's text is shown translated (the creator wrote it in the other language).
export const isTranslated = (item: Item, locale: Locale) => item.originalLanguage !== locale;
