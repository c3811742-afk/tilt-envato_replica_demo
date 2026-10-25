import { seedLanguages, sourceLanguageCode } from '@/features/admin/mocks';
import type { LanguageInput, SiteLanguage, TranslationEntry, Translations } from '@/features/admin/types';
import { sameText } from '@/features/admin/utils/lists';
import { texts } from '@/shared/constants';
import { isLocale } from '@/shared/theme';
import { addedLanguagesStore, hiddenLocalesStore, siteLanguageOptions, textEditStore, type AddedLanguage } from '@/shared/utils';
import { AdminApiError } from './errors';
import { authorize, logAction, respond } from './mockServer';

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

// English and Arabic ship with the site; the team can take either out of its language menu. The languages the team
// adds are saved where the site reads them, and show in its language menu once they're published.
const allLanguages = (): AddedLanguage[] => {
  const hidden = hiddenLocalesStore.get();
  return [
    ...seedLanguages.map((language) => ({ ...language, published: !(isLocale(language.code) && hidden.includes(language.code)) })),
    ...addedLanguagesStore.get(),
  ];
};

const withProgress = (language: AddedLanguage): SiteLanguage => {
  const isSource = language.code === sourceLanguageCode;
  const total = sourceTexts.length;
  const translated = isSource ? total : entriesFor(language.code).filter((entry) => entry.value.trim()).length;
  return { ...language, isSource, translated, total };
};

export const fetchLanguages = () => respond(() => allLanguages().map(withProgress));

// A new language starts with no translations and isn't on the site until the team publishes it.
export const addLanguage = (actorId: string, input: LanguageInput) =>
  respond(() => {
    const actor = authorize(actorId, 'addLanguages');
    const language: AddedLanguage = { ...input, code: input.code.trim(), name: input.name.trim(), nativeName: input.nativeName.trim(), published: false };
    if (allLanguages().some((current) => sameText(current.code, language.code))) throw new AdminApiError('languageExists');

    addedLanguagesStore.set([...addedLanguagesStore.get(), language]);
    logAction(actor, 'languageAdded', { kind: 'language', id: language.code, label: language.name });
    return withProgress(language);
  });

// Shows a language in the site's language menu, or takes it out. Texts not translated yet show in English (or Arabic,
// for a right-to-left language). The site always keeps at least one language.
export const setLanguagePublished = (actorId: string, code: string, published: boolean) =>
  respond(() => {
    const actor = authorize(actorId, 'addLanguages');
    const language = allLanguages().find((current) => current.code === code);
    if (!language) throw new AdminApiError('notFound');

    const hidden = hiddenLocalesStore.get();
    const nextHidden = isLocale(code) ? (published ? hidden.filter((current) => current !== code) : [...new Set([...hidden, code])]) : hidden;
    const nextAdded = addedLanguagesStore.get().map((current) => (current.code === code ? { ...current, published } : current));
    if (siteLanguageOptions(nextHidden, nextAdded).length === 0) throw new AdminApiError('lastLanguage');

    hiddenLocalesStore.set(nextHidden);
    addedLanguagesStore.set(nextAdded);
    const saved = { ...language, published };
    logAction(actor, 'languageUpdated', { kind: 'language', id: code, label: language.name }, { change: published ? 'shown' : 'hidden' });
    return withProgress(saved);
  });

// null when the language doesn't exist or is the source language (it has nothing to translate).
export const fetchTranslations = (code: string) =>
  respond((): Translations | null => {
    const language = allLanguages().find((current) => current.code === code);
    if (!language || language.code === sourceLanguageCode) return null;
    return { language: withProgress(language), entries: entriesFor(code) };
  });

// Corrections show on the site right away (in this browser); the text files stay as they are.
export const saveTranslation = (actorId: string, code: string, key: string, value: string) =>
  respond((): TranslationEntry => {
    const actor = authorize(actorId, 'manageTranslations');
    const language = allLanguages().find((current) => current.code === code);
    const source = sourceTexts.find(([sourceKey]) => sourceKey === key);
    if (!language || !source) throw new AdminApiError('notFound');

    const edits = textEditStore.get();
    textEditStore.set({ ...edits, [code]: { ...edits[code], [key]: value.trim() } });
    logAction(actor, 'translationUpdated', { kind: 'language', id: code, label: language.name }, { textKey: key });
    return { key, source: source[1], value: value.trim() };
  });
