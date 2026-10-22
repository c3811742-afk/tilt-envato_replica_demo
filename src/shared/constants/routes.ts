import { returnToParam } from './auth';
import { filterKeys, type FilterKey } from './browse';

export const routes = {
  home: '/',
  search: '/search',
  categories: '/categories',
  item: '/item/:id',
  creator: '/creator/:id',
  collections: '/collections',
  collection: '/collections/:id',
  saved: '/saved',
  howItWorks: '/how-it-works',
  pricing: '/pricing',
  faq: '/faq',
  terms: '/terms',
  privacy: '/privacy',
  signIn: '/sign-in',
  signUp: '/sign-up',
  verifyEmail: '/verify-email',
  verifyPhone: '/verify-phone',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  completeProfile: '/complete-profile',
  checkout: '/checkout',
  account: '/account/:section',
  notifications: '/notifications',
  notFound: '*', // any path that matches no other route
} as const;

// Query parameters read by the search page. Each filter uses its own key (e.g. "orientation=portrait,square").
export const searchParamKeys = {
  query: 'q',
  category: 'category',
  sort: 'sort',
  mustInclude: 'must',
  exclude: 'not',
  authors: 'by',
  excludeAuthors: 'notBy',
  occasion: 'occasion',
  business: 'business',
  spotlight: 'local',
  look: 'look',
  soundsLike: 'soundsLike',
  soundSource: 'source',
  uploadedFrom: 'from',
  uploadedTo: 'to',
  page: 'page',
} as const;

// Several values in one parameter: "portrait,square".
export const listSeparator = ',';

export interface SearchPathOptions {
  query?: string;
  category?: string;
  sort?: string;
  filters?: Partial<Record<FilterKey, readonly string[]>>;
  mustInclude?: string;
  exclude?: string;
  authors?: readonly string[];
  excludeAuthors?: readonly string[];
  occasion?: string;
  business?: string;
  spotlight?: string;
  look?: string;
  soundsLike?: string;
  soundSource?: string;
  uploadedFrom?: string; // ISO date
  uploadedTo?: string; // ISO date
  page?: number; // left out for the first page
}

// routes.search with its query string: searchPath({ query: 'logo' }) -> '/search?q=logo'
export const searchPath = ({ filters = {}, page, authors, excludeAuthors, ...single }: SearchPathOptions = {}) => {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(single) as [keyof typeof single, string | undefined][]) {
    if (value?.trim()) params.set(searchParamKeys[name], value.trim());
  }
  if (authors?.length) params.set(searchParamKeys.authors, authors.join(listSeparator));
  if (excludeAuthors?.length) params.set(searchParamKeys.excludeAuthors, excludeAuthors.join(listSeparator));
  for (const key of filterKeys) {
    const values = filters[key];
    if (values?.length) params.set(key, values.join(listSeparator));
  }
  if (page && page > 1) params.set(searchParamKeys.page, String(page));
  const search = params.toString();
  return search ? `${routes.search}?${search}` : routes.search;
};

// Query parameters read by the checkout page.
export const checkoutParamKeys = {
  plan: 'plan',
  months: 'months',
} as const;

// routes.checkout for a plan and length: checkoutPath('individual', 12) -> '/checkout?plan=individual&months=12'
export const checkoutPath = (planId: string, months: number) =>
  `${routes.checkout}?${new URLSearchParams({ [checkoutParamKeys.plan]: planId, [checkoutParamKeys.months]: String(months) })}`;

// Adds the page to come back to after signing in: withReturnTo('/sign-in', '/checkout?plan=team') -> '/sign-in?next=...'
export const withReturnTo = (path: string, returnTo?: string) =>
  returnTo ? `${path}?${new URLSearchParams({ [returnToParam]: returnTo })}` : path;

// routes.account for one settings page: accountPath('security') -> '/account/security'
export const accountPath = (section: string) => routes.account.replace(':section', section);

export const itemPath = (id: string) => routes.item.replace(':id', encodeURIComponent(id));

export const creatorPath = (id: string) => routes.creator.replace(':id', encodeURIComponent(id));

export const collectionPath = (id: string) => routes.collection.replace(':id', encodeURIComponent(id));
