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
import { authorize, db, findById, logAction, newId, now, respond } from './mockServer';

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

export const fetchFaqs = () => respond(() => db.faqs);

// Adds a question at the end, or updates it when an id is given.
export const saveFaq = (actorId: string, input: FaqInput, id?: string) =>
  respond((): Faq => {
    const actor = authorize(actorId, 'manageContent');
    const values = { question: trimLocalized(input.question), answer: trimLocalized(input.answer) };
    const faq = id ? Object.assign(findById(db.faqs, id), values) : { id: newId(), ...values };
    if (!id) db.faqs.push(faq);
    logContent(actor, 'faqs', faq.id, faq.question, id ? 'details' : 'added');
    return faq;
  });

export const deleteFaq = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageContent');
    const faq = findById(db.faqs, id);
    db.faqs = db.faqs.filter((current) => current.id !== id);
    logContent(actor, 'faqs', faq.id, faq.question, 'removed', true);
    return faq;
  });

export const moveFaq = (actorId: string, id: string, direction: MoveDirection) =>
  respond(() => {
    const actor = authorize(actorId, 'manageContent');
    const faq = findById(db.faqs, id);
    db.faqs = moveItem(db.faqs, id, direction);
    logContent(actor, 'faqs', faq.id, faq.question, 'moved');
    return db.faqs;
  });

export const fetchLegalPages = () => respond(() => db.legalPages);

export const saveLegalPage = (actorId: string, id: LegalPageId, body: LocalizedText) =>
  respond(() => {
    const actor = authorize(actorId, 'manageContent');
    const page = findById(db.legalPages, id);
    page.body = trimLocalized(body);
    page.updatedAt = now();
    page.updatedBy = actor.name;
    const labels = { en: texts.en.admin.content.legalPages[id], ar: texts.ar.admin.content.legalPages[id] };
    logContent(actor, 'legal', id, labels);
    return page;
  });

// Help Center, Learn or What's New articles, most recently changed first.
export const fetchArticles = (kind: ArticleKind) =>
  respond(() =>
    db.articles.filter((article) => article.kind === kind).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );

// Adds an article, or updates it when an id is given. Publishing for the first time sets the publish date.
export const saveArticle = (actorId: string, input: ArticleInput, id?: string) =>
  respond((): Article => {
    const actor = authorize(actorId, 'manageContent');
    const at = now();
    const values = { ...input, title: trimLocalized(input.title), body: trimLocalized(input.body), updatedAt: at };
    const existing = id ? findById(db.articles, id) : undefined;
    const statusChanged = existing && existing.status !== input.status;
    const article: Article = existing ? Object.assign(existing, values) : { id: newId(), ...values };
    if (article.status === 'published' && !article.publishedAt) article.publishedAt = at;
    if (!existing) db.articles.push(article);

    const change: AuditChange = statusChanged ? input.status : existing ? 'details' : 'added';
    logContent(actor, articleArea[article.kind], article.id, article.title, change);
    return article;
  });

export const deleteArticle = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageContent');
    const article = findById(db.articles, id);
    db.articles = db.articles.filter((current) => current.id !== id);
    logContent(actor, articleArea[article.kind], article.id, article.title, 'removed', true);
    return article;
  });
