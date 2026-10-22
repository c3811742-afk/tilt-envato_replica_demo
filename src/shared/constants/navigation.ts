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
} as const satisfies Record<string, { to: string; icon: IconName }>;

export type NavKey = keyof typeof navItems;

// Which destinations each menu shows, in order.
export const navMenus = {
  header: ['categories', 'pricing', 'howItWorks', 'faq'],
  phoneTabs: ['home', 'categories', 'search', 'pricing', 'faq'],
  footerExplore: ['categories', 'collections', 'howItWorks', 'pricing'],
  footerSupport: ['faq'], // reachable from every page, under the WhatsApp contact
} as const satisfies Record<string, readonly NavKey[]>;
