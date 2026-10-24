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
