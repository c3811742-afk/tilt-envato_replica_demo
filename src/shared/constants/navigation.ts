import type { IconName } from '@/shared/assets';
import { routes } from './routes';

// Every main destination once: its path and icon. The label is text.nav[key].
export const navItems = {
  home: { to: routes.home, icon: 'home' },
  categories: { to: routes.categories, icon: 'grid' },
  collections: { to: routes.collections, icon: 'layers' },
  search: { to: routes.search, icon: 'search' },
  pricing: { to: routes.pricing, icon: 'tag' },
  howItWorks: { to: routes.howItWorks, icon: 'info' },
  faq: { to: routes.faq, icon: 'help' },
  ai: { to: routes.ai, icon: 'sparkle' },
  blog: { to: routes.blog, icon: 'list' },
  courses: { to: routes.courses, icon: 'play' },
  learn: { to: routes.learn, icon: 'graduation' },
  help: { to: routes.help, icon: 'help' },
  support: { to: routes.support, icon: 'message' },
  licenseCheck: { to: routes.licenseCheck, icon: 'license' },
  about: { to: routes.about, icon: 'info' },
  products: { to: routes.products, icon: 'grid' },
  careers: { to: routes.careers, icon: 'users' },
  news: { to: routes.news, icon: 'bell' },
  authors: { to: routes.authors, icon: 'upload' },
  partners: { to: routes.partners, icon: 'link' },
  terms: { to: routes.terms, icon: 'license' },
  privacy: { to: routes.privacy, icon: 'shield' },
  licenseTerms: { to: routes.licenseTerms, icon: 'license' },
  fairUse: { to: routes.fairUse, icon: 'info' },
} as const satisfies Record<string, { to: string; icon: IconName }>;

export type NavKey = keyof typeof navItems;

// Which destinations each menu shows, in order.
export const navMenus = {
  header: ['categories', 'ai', 'pricing', 'howItWorks', 'faq'],
  phoneTabs: ['home', 'categories', 'search', 'pricing', 'faq'],
  footerExplore: ['categories', 'collections', 'ai', 'howItWorks', 'pricing'],
  footerResources: ['blog', 'courses', 'learn', 'help'],
  footerCompany: ['about', 'products', 'careers', 'news', 'authors', 'partners'],
  footerSupport: ['faq', 'support', 'licenseCheck'], // reachable from every page, with the WhatsApp contact
  footerLegal: ['terms', 'privacy', 'licenseTerms', 'fairUse'],
} as const satisfies Record<string, readonly NavKey[]>;
