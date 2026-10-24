import { sourceLanguageCode } from '@/features/admin/mocks';
import type { LanguageInput, SiteLanguage, TranslationEntry, Translations } from '@/features/admin/types';
import { sameText } from '@/features/admin/utils/lists';
import { texts } from '@/shared/constants';
import { textEditStore } from '@/shared/utils';
import { AdminApiError } from './errors';
import { authorize, db, logAction, respond } from './mockServer';

// Turns the nested text object into flat entries: { admin: { nav: { tags: 'Tags' } } } -> ['admin.nav.tags', 'Tags'].
const flatten = (value: unknown, prefix = ''): [string, string][] => {
  if (typeof value === 'string') return [[prefix, value]];
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
};

// The site's real texts: English is the source, Arabic is the translation that ships with the site.
const sourceTexts = flatten(texts.en);
const shippedTranslations: Record<string, Map<string, string>> = { ar: new Map(flatten(texts.ar)) };

const translationOf = (code: string, key: string) =>
  textEditStore.get()[code]?.[key] ?? shippedTranslations[code]?.get(key) ?? '';

const entriesFor = (code: string): TranslationEntry[] =>
  sourceTexts.map(([key, source]) => ({ key, source, value: translationOf(code, key) }));

const withProgress = (language: LanguageInput): SiteLanguage => {
  const isSource = language.code === sourceLanguageCode;
  const total = sourceTexts.length;
  const translated = isSource ? total : entriesFor(language.code).filter((entry) => entry.value.trim()).length;
  return { ...language, isSource, translated, total };
};

export const fetchLanguages = () => respond(() => db.languages.map(withProgress));

// A new language starts with no translations. It shows on the site once the team translates it.
export const addLanguage = (actorId: string, input: LanguageInput) =>
  respond(() => {
    const actor = authorize(actorId, 'addLanguages');
    const language = { ...input, code: input.code.trim(), name: input.name.trim(), nativeName: input.nativeName.trim() };
    if (db.languages.some((current) => sameText(current.code, language.code))) throw new AdminApiError('languageExists');

    db.languages.push(language);
    logAction(actor, 'languageAdded', { kind: 'language', id: language.code, label: language.name });
    return withProgress(language);
  });

// null when the language doesn't exist or is the source language (it has nothing to translate).
export const fetchTranslations = (code: string) =>
  respond((): Translations | null => {
    const language = db.languages.find((current) => current.code === code);
    if (!language || language.code === sourceLanguageCode) return null;
    return { language: withProgress(language), entries: entriesFor(code) };
  });

// Corrections show on the site right away (in this browser); the text files stay as they are.
export const saveTranslation = (actorId: string, code: string, key: string, value: string) =>
  respond((): TranslationEntry => {
    const actor = authorize(actorId, 'manageTranslations');
    const language = db.languages.find((current) => current.code === code);
    const source = sourceTexts.find(([sourceKey]) => sourceKey === key);
    if (!language || !source) throw new AdminApiError('notFound');

    const edits = textEditStore.get();
    textEditStore.set({ ...edits, [code]: { ...edits[code], [key]: value.trim() } });
    logAction(actor, 'translationUpdated', { kind: 'language', id: code, label: language.name }, { textKey: key });
    return { key, source: source[1], value: value.trim() };
  });
