import type { SiteArticle, SiteArticleKind, SiteArticleStatus, SiteFaq, SiteLegalPage } from '@/shared/types';

// The site's own content: what the admin saves is what the FAQ, legal and help pages show.
export type Faq = SiteFaq;
export type FaqInput = Omit<Faq, 'id'>;

export type { LegalPageId } from '@/shared/types';
export type LegalPage = SiteLegalPage;

// Help Center articles, Learn articles and What's New posts share one shape and one editor.
export type ArticleKind = SiteArticleKind;
export type ArticleStatus = SiteArticleStatus;
export type Article = SiteArticle;

export type ArticleInput = Pick<Article, 'kind' | 'title' | 'body' | 'status' | 'topic'>;
