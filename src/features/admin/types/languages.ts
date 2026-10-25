export type TextDirection = 'ltr' | 'rtl';

export interface SiteLanguage {
  code: string; // e.g. 'en', 'ar', 'fr'
  name: string; // in English
  nativeName: string; // in the language itself
  direction: TextDirection;
  isSource: boolean; // English: every other language is translated from it
  published: boolean; // in the site's language menu
  translated: number; // how many texts have a translation
  total: number;
}

export type LanguageInput = Pick<SiteLanguage, 'code' | 'name' | 'nativeName' | 'direction'>;

export interface TranslationEntry {
  key: string; // e.g. 'admin.review.accept'
  source: string; // the English text
  value: string; // the translation, empty when missing
}

export interface Translations {
  language: SiteLanguage;
  entries: TranslationEntry[];
}
