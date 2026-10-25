import {
  licenseTermsUpdatedAt,
  privacyUpdatedAt,
  releaseNotes,
  storageKeys,
  termsUpdatedAt,
  texts,
  type HelpTopic,
} from '@/shared/constants';
import { mockHelpArticles, mockLearnGuides } from '@/shared/mocks';
import type { Locale } from '@/shared/theme';
import type { HelpArticle, LearnGuide, LegalPageId, LocalizedText, SiteArticle, SiteFaq, SiteLegalPage } from '@/shared/types';
import { createStoredValue } from './storedValue';

// The site's FAQ, legal pages and articles. The admin team edits them; until it saves, the site shows the
// content it was built with (the text files and mock articles), so nothing changes before an edit.

const isList = <T>(value: unknown): value is T[] => Array.isArray(value);
const both = (pick: (locale: Locale) => string): LocalizedText => ({ en: pick('en'), ar: pick('ar') });
const paragraphs = (body: string) => body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

// ---------- FAQ ----------

const builtInFaqs = (): SiteFaq[] =>
  texts.en.faq.groups.flatMap((group, groupIndex) =>
    group.items.map((_, itemIndex) => ({
      id: `faq-${groupIndex}-${itemIndex}`,
      group: both((locale) => texts[locale].faq.groups[groupIndex].title),
      question: both((locale) => texts[locale].faq.groups[groupIndex].items[itemIndex].question),
      answer: both((locale) => texts[locale].faq.groups[groupIndex].items[itemIndex].answer),
    })),
  );

export const faqStore = createStoredValue<SiteFaq[]>(storageKeys.faqs, isList, builtInFaqs);

// The FAQ page's groups, in order, with their questions in the page's language.
export const faqGroups = (locale: Locale) => {
  const groups: { title: string; items: { question: string; answer: string }[] }[] = [];
  faqStore.get().forEach((faq) => {
    const title = faq.group[locale];
    const group = groups.find((current) => current.title === title) ?? groups[groups.push({ title, items: [] }) - 1];
    group.items.push({ question: faq.question[locale], answer: faq.answer[locale] });
  });
  return groups;
};

// ---------- Legal pages ----------

type LegalText = { sections: readonly { title: string; text: string }[] };
const legalText = (id: LegalPageId, locale: Locale): LegalText =>
  ({ terms: texts[locale].terms, privacy: texts[locale].privacy, license: texts[locale].licenseTerms })[id];

const builtInUpdatedAt: Record<LegalPageId, string> = { terms: termsUpdatedAt, privacy: privacyUpdatedAt, license: licenseTermsUpdatedAt };

const builtInLegalPages = (): SiteLegalPage[] =>
  (['terms', 'privacy', 'license'] as const).map((id) => ({
    id,
    body: both((locale) => legalText(id, locale).sections.map((section) => `${section.title}\n${section.text}`).join('\n\n')),
    updatedAt: builtInUpdatedAt[id],
  }));

export const legalPageStore = createStoredValue<SiteLegalPage[]>(storageKeys.legalPages, isList, builtInLegalPages);

// A legal page as titled sections: each block's first line is its title, the rest its text.
export const legalPage = (id: LegalPageId, locale: Locale) => {
  const page = legalPageStore.get().find((current) => current.id === id) ?? builtInLegalPages().find((current) => current.id === id);
  const sections = paragraphs(page?.body[locale] ?? '').map((block) => {
    const [title, ...rest] = block.split('\n');
    return rest.length ? { title: title.trim(), text: rest.join(' ').trim() } : { title: '', text: title.trim() };
  });
  return { updatedAt: page?.updatedAt ?? builtInUpdatedAt[id], sections };
};

// ---------- Articles ----------

const builtInArticles = (): SiteArticle[] => [
  ...mockHelpArticles.map((article) => ({
    id: article.id,
    kind: 'help' as const,
    topic: article.topic,
    title: article.title,
    body: both((locale) => article.body[locale].join('\n\n')),
    status: 'published' as const,
    updatedAt: termsUpdatedAt,
    publishedAt: termsUpdatedAt,
  })),
  ...mockLearnGuides.map((guide) => ({
    id: guide.id,
    kind: 'learn' as const,
    topic: guide.topic,
    title: guide.title,
    body: both((locale) => guide.steps[locale].join('\n\n')),
    status: 'published' as const,
    updatedAt: termsUpdatedAt,
    publishedAt: termsUpdatedAt,
  })),
  ...releaseNotes.map((note) => ({
    id: note.id,
    kind: 'releaseNote' as const,
    title: both((locale) => texts[locale].releaseNotes[note.id].title),
    body: both((locale) => texts[locale].releaseNotes[note.id].text),
    status: 'published' as const,
    updatedAt: note.date,
    publishedAt: note.date,
  })),
];

export const articleStore = createStoredValue<SiteArticle[]>(storageKeys.articles, isList, builtInArticles);

const published = (kind: SiteArticle['kind']) =>
  articleStore.get().filter((article) => article.kind === kind && article.status === 'published');

const defaultTopic: HelpTopic = 'licensing';
const wordsPerMinute = 200;

// Summaries come from the article itself: the built-in ones keep theirs, new ones use their first paragraph.
const summaryOf = (article: SiteArticle, locale: Locale) => paragraphs(article.body[locale])[0] ?? '';

export const helpArticles = (): HelpArticle[] =>
  published('help').map((article) => {
    const builtIn = mockHelpArticles.find((current) => current.id === article.id);
    return {
      id: article.id,
      topic: article.topic ?? defaultTopic,
      title: article.title,
      summary: builtIn?.summary ?? both((locale) => summaryOf(article, locale)),
      body: { en: paragraphs(article.body.en), ar: paragraphs(article.body.ar) },
    };
  });

export const learnGuides = (): LearnGuide[] =>
  published('learn').map((article) => {
    const builtIn = mockLearnGuides.find((current) => current.id === article.id);
    const steps = { en: paragraphs(article.body.en), ar: paragraphs(article.body.ar) };
    return {
      id: article.id,
      topic: article.topic ?? defaultTopic,
      title: article.title,
      summary: builtIn?.summary ?? both((locale) => summaryOf(article, locale)),
      minutes: builtIn?.minutes ?? Math.max(1, Math.round(article.body.en.split(/\s+/).length / wordsPerMinute)),
      steps,
    };
  });

// What's new, newest first: { id, date, title, text } in both languages.
export const publishedReleaseNotes = () =>
  published('releaseNote')
    .map((article) => ({ id: article.id, date: article.publishedAt ?? article.updatedAt, title: article.title, text: article.body }))
    .sort((a, b) => b.date.localeCompare(a.date));
