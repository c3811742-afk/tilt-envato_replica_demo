import type {
  Admin,
  Article,
  ArticleInput,
  ArticleKind,
  AuditArea,
  AuditChange,
  Faq,
  FaqInput,
  LegalPageId,
  LocalizedText,
  MoveDirection,
} from '@/features/admin/types';
import { moveItem } from '@/features/admin/utils/lists';
import { trimLocalized } from '@/features/admin/utils/validation';
import { texts } from '@/shared/constants';
import { articleStore, faqStore, legalPageStore } from '@/shared/utils';
import { authorize, findById, logAction, newId, now, respond } from './mockServer';

// FAQs, legal pages and articles are the site's own: saving here changes what the FAQ, legal, Help Center,
// Learn and What's new pages show.

const articleArea: Record<ArticleKind, AuditArea> = { help: 'help', learn: 'learn', releaseNote: 'releaseNotes' };

const logContent = (
  actor: Admin,
  area: AuditArea,
  id: string,
  labels: LocalizedText,
  change: AuditChange = 'details',
  deleted = false,
) =>
  logAction(actor, deleted ? 'contentDeleted' : 'contentSaved', { kind: 'content', id, label: labels.en, labels }, {
    area,
    change,
  });

export const fetchFaqs = () => respond(() => faqStore.get());

// Adds a question at the end, or updates it when an id is given.
export const saveFaq = (actorId: string, input: FaqInput, id?: string) =>
  respond((): Faq => {
    const actor = authorize(actorId, 'manageContent');
    const values = { group: trimLocalized(input.group), question: trimLocalized(input.question), answer: trimLocalized(input.answer) };
    const faqs = faqStore.get();
    const faq: Faq = id ? { ...findById(faqs, id), ...values } : { id: newId(), ...values };
    faqStore.set(id ? faqs.map((current) => (current.id === id ? faq : current)) : [...faqs, faq]);
    logContent(actor, 'faqs', faq.id, faq.question, id ? 'details' : 'added');
    return faq;
  });

export const deleteFaq = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageContent');
    const faqs = faqStore.get();
    const faq = findById(faqs, id);
    faqStore.set(faqs.filter((current) => current.id !== id));
    logContent(actor, 'faqs', faq.id, faq.question, 'removed', true);
    return faq;
  });

export const moveFaq = (actorId: string, id: string, direction: MoveDirection) =>
  respond(() => {
    const actor = authorize(actorId, 'manageContent');
    const faqs = faqStore.get();
    const faq = findById(faqs, id);
    const moved = moveItem(faqs, id, direction);
    faqStore.set(moved);
    logContent(actor, 'faqs', faq.id, faq.question, 'moved');
    return moved;
  });

export const fetchLegalPages = () => respond(() => legalPageStore.get());

export const saveLegalPage = (actorId: string, id: LegalPageId, body: LocalizedText) =>
  respond(() => {
    const actor = authorize(actorId, 'manageContent');
    const pages = legalPageStore.get();
    const page = { ...findById(pages, id), body: trimLocalized(body), updatedAt: now(), updatedBy: actor.name };
    legalPageStore.set(pages.map((current) => (current.id === id ? page : current)));
    const labels = { en: texts.en.admin.content.legalPages[id], ar: texts.ar.admin.content.legalPages[id] };
    logContent(actor, 'legal', id, labels);
    return page;
  });

// Help Center, Learn or What's New articles, most recently changed first.
export const fetchArticles = (kind: ArticleKind) =>
  respond(() =>
    articleStore
      .get()
      .filter((article) => article.kind === kind).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );

// Adds an article, or updates it when an id is given. Publishing for the first time sets the publish date.
export const saveArticle = (actorId: string, input: ArticleInput, id?: string) =>
  respond((): Article => {
    const actor = authorize(actorId, 'manageContent');
    const at = now();
    const values = { ...input, title: trimLocalized(input.title), body: trimLocalized(input.body), updatedAt: at };
    const articles = articleStore.get();
    const existing = id ? findById(articles, id) : undefined;
    const statusChanged = existing && existing.status !== input.status;
    const article: Article = existing ? { ...existing, ...values } : { id: newId(), ...values };
    if (article.status === 'published' && !article.publishedAt) article.publishedAt = at;
    articleStore.set(existing ? articles.map((current) => (current.id === id ? article : current)) : [...articles, article]);

    const change: AuditChange = statusChanged ? input.status : existing ? 'details' : 'added';
    logContent(actor, articleArea[article.kind], article.id, article.title, change);
    return article;
  });

export const deleteArticle = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageContent');
    const articles = articleStore.get();
    const article = findById(articles, id);
    articleStore.set(articles.filter((current) => current.id !== id));
    logContent(actor, articleArea[article.kind], article.id, article.title, 'removed', true);
    return article;
  });
