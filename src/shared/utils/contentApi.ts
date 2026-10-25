import { mockBlogPosts, mockCourses, mockJobs, mockNews } from '@/shared/mocks';
import type { BlogPost, Course, HelpArticle, Job, LearnGuide, NewsPost } from '@/shared/types';
import { respond } from './mockResponse';
import { helpArticles, learnGuides } from './siteContent';

const newestFirst = <T extends { publishedAt: string }>(posts: T[]) => [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

// Help Center, Learn guides, the blog, courses and company pages (the demo's content comes from mock data).
// A lookup by id gives null when nothing has it (the page shows "not found").
export const contentApi = {
  getHelpArticles: (): Promise<HelpArticle[]> => respond(helpArticles()),
  getHelpArticle: (id: string): Promise<HelpArticle | null> => respond(helpArticles().find((article) => article.id === id) ?? null),
  getLearnGuides: (): Promise<LearnGuide[]> => respond(learnGuides()),
  getLearnGuide: (id: string): Promise<LearnGuide | null> => respond(learnGuides().find((guide) => guide.id === id) ?? null),
  getBlogPosts: (): Promise<BlogPost[]> => respond(newestFirst(mockBlogPosts)),
  getBlogPost: (id: string): Promise<BlogPost | null> => respond(mockBlogPosts.find((post) => post.id === id) ?? null),
  getCourses: (): Promise<Course[]> => respond(mockCourses),
  getCourse: (id: string): Promise<Course | null> => respond(mockCourses.find((course) => course.id === id) ?? null),
  getJobs: (): Promise<Job[]> => respond(mockJobs),
  getNews: (): Promise<NewsPost[]> => respond(newestFirst(mockNews)),
};
