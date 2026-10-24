import type { BlogTopic, CourseLevel, HelpTopic, JobTeam } from '@/shared/constants';
import type { AccentName, Locale } from '@/shared/theme';
import type { LocalizedText } from './catalog';

// Paragraphs or steps, written in each language.
export type LocalizedList = Record<Locale, string[]>;

export interface HelpArticle {
  id: string;
  topic: HelpTopic;
  title: LocalizedText;
  summary: LocalizedText;
  body: LocalizedList; // paragraphs
}

export interface LearnGuide {
  id: string;
  topic: HelpTopic;
  title: LocalizedText;
  summary: LocalizedText;
  minutes: number; // reading time
  steps: LocalizedList;
}

export interface BlogPost {
  id: string;
  topic: BlogTopic;
  title: LocalizedText;
  summary: LocalizedText;
  body: LocalizedList; // paragraphs
  author: string; // a person's name: never translated
  publishedAt: string; // ISO date
  readMinutes: number;
  accent: AccentName;
}

export interface CourseLesson {
  title: LocalizedText;
  minutes: number;
}

export interface Course {
  id: string;
  kind: 'course' | 'tutorial'; // a course has several lessons; a tutorial is one
  level: CourseLevel;
  title: LocalizedText;
  summary: LocalizedText;
  instructor: string;
  lessons: CourseLesson[];
  accent: AccentName;
}

export interface Job {
  id: string;
  team: JobTeam;
  title: LocalizedText;
  location: LocalizedText;
  remote: boolean;
  summary: LocalizedText;
}

export interface NewsPost {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  publishedAt: string; // ISO date
}

// ---------- Content the admin team edits ----------

// One question on the FAQ page, in its group.
export interface SiteFaq {
  id: string;
  group: LocalizedText; // the heading it is shown under
  question: LocalizedText;
  answer: LocalizedText;
}

export type LegalPageId = 'terms' | 'privacy' | 'license';

// A legal page's text: blocks separated by an empty line, each a title line and its text.
export interface SiteLegalPage {
  id: LegalPageId;
  body: LocalizedText;
  updatedAt: string; // ISO date
  updatedBy?: string; // the team member who last changed it
}

// Help Center articles, Learn guides and What's new posts share one shape and one editor.
export type SiteArticleKind = 'help' | 'learn' | 'releaseNote';
export type SiteArticleStatus = 'draft' | 'published';

export interface SiteArticle {
  id: string;
  kind: SiteArticleKind;
  title: LocalizedText;
  body: LocalizedText; // paragraphs (or a guide's steps) separated by an empty line
  status: SiteArticleStatus; // only published ones show on the site
  topic?: HelpTopic; // Help Center and Learn
  updatedAt: string;
  publishedAt?: string;
}
