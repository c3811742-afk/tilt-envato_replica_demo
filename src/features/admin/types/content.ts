import type { LocalizedText } from './catalog';

export interface Faq {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

export type FaqInput = Omit<Faq, 'id'>;

export type LegalPageId = 'terms' | 'privacy' | 'license';

export interface LegalPage {
  id: LegalPageId;
  body: LocalizedText;
  updatedAt: string;
  updatedBy: string;
}

// Help Center articles, Learn articles and What's New posts share one shape and one editor.
export type ArticleKind = 'help' | 'learn' | 'releaseNote';
export type ArticleStatus = 'draft' | 'published';

export interface Article {
  id: string;
  kind: ArticleKind;
  title: LocalizedText;
  body: LocalizedText;
  status: ArticleStatus;
  updatedAt: string;
  publishedAt?: string;
}

export type ArticleInput = Pick<Article, 'kind' | 'title' | 'body' | 'status'>;
