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
  favorites: '/favorites',
  myCollections: '/my-collections',
  myCollection: '/my-collections/:id',
  sharedCollection: '/shared/:shareId',
  downloads: '/downloads',
  licenseCheck: '/license-check',
  ai: '/ai',
  aiTool: '/ai/tools/:tool',
  aiHistory: '/ai/history',
  aiGuides: '/ai/guides',
  contactSales: '/contact-sales',
  demo: '/demo',
  team: '/team',
  support: '/support',
  help: '/help',
  helpArticle: '/help/:id',
  learn: '/learn',
  learnGuide: '/learn/:id',
  accountSuspended: '/account-suspended',
  blog: '/blog',
  blogPost: '/blog/:id',
  courses: '/courses',
  course: '/courses/:id',
  about: '/about',
  products: '/products',
  careers: '/careers',
  news: '/news',
  authors: '/authors',
  partners: '/partners',
  licenseTerms: '/license-terms',
  fairUse: '/fair-use',
  unsubscribe: '/newsletter/unsubscribe',
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
  creatorOnboarding: '/creator/onboarding',
  admin: '/admin',
  adminDashboard: '/admin/dashboard',
  adminReview: '/admin/review',
  adminReviewElement: '/admin/review/:elementId',
  adminLiveElements: '/admin/elements',
  adminAdmins: '/admin/admins',
  adminAuditLog: '/admin/audit-log',
  adminCategories: '/admin/categories',
  adminCategory: '/admin/categories/:categoryId',
  adminTags: '/admin/tags',
  adminHomepage: '/admin/homepage',
  adminUnusedElements: '/admin/unused-elements',
  adminSearchInsights: '/admin/search-insights',
  adminContent: '/admin/content',
  adminLanguages: '/admin/languages',
  adminTranslations: '/admin/languages/:languageCode',
  adminMessages: '/admin/messages',
  adminPrograms: '/admin/programs',
  adminAi: '/admin/ai',
  adminPlans: '/admin/plans',
  adminBilling: '/admin/billing',
  adminPayouts: '/admin/payouts',
  adminInvoices: '/admin/invoices',
  adminSupport: '/admin/support',
  adminTicket: '/admin/support/tickets/:ticketId',
  adminLicenses: '/admin/licenses',
  adminSearch: '/admin/search',
  adminUsers: '/admin/users',
  adminUser: '/admin/users/:userId',
  adminCreators: '/admin/creators',
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
  credits: 'credits',
  pass: 'pass',
} as const;

// routes.checkout for a plan and length: checkoutPath('individual', 12) -> '/checkout?plan=individual&months=12'
export const checkoutPath = (planId: string, months: number, credits?: number) =>
  `${routes.checkout}?${new URLSearchParams({
    [checkoutParamKeys.plan]: planId,
    [checkoutParamKeys.months]: String(months),
    ...(credits ? { [checkoutParamKeys.credits]: String(credits) } : {}),
  })}`;

// Adds the page to come back to after signing in: withReturnTo('/sign-in', '/checkout?plan=team') -> '/sign-in?next=...'
export const withReturnTo = (path: string, returnTo?: string) =>
  returnTo ? `${path}?${new URLSearchParams({ [returnToParam]: returnTo })}` : path;

// routes.account for one settings page: accountPath('security') -> '/account/security'
export const accountPath = (section: string) => routes.account.replace(':section', section);

export const itemPath = (id: string) => routes.item.replace(':id', encodeURIComponent(id));

export const creatorPath = (id: string) => routes.creator.replace(':id', encodeURIComponent(id));

export const collectionPath = (id: string) => routes.collection.replace(':id', encodeURIComponent(id));

export const myCollectionPath = (id: string) => routes.myCollection.replace(':id', encodeURIComponent(id));

export const sharedCollectionPath = (shareId: string) => routes.sharedCollection.replace(':shareId', encodeURIComponent(shareId));

// Query parameter of the license check page: licenseCheckPath('A7F3-…') opens it with the code filled in.
export const licenseCheckParam = 'code';
export const licenseCheckPath = (code?: string) =>
  code ? `${routes.licenseCheck}?${new URLSearchParams({ [licenseCheckParam]: code })}` : routes.licenseCheck;

// Query parameters of checkout for a project pass, a seat count or an Ultimate credit tier.
export const checkoutPassPath = (passId: string) => `${routes.checkout}?${new URLSearchParams({ [checkoutParamKeys.pass]: passId })}`;

// The plan settings with the "Change plan" dialog open on a plan: planChangePath('ultimate') -> '/account/plan?change=ultimate'
export const planChangeParam = 'change';
export const planChangePath = (planId: string) => `${accountPath('plan')}?${new URLSearchParams({ [planChangeParam]: planId })}`;

// "My collections" on the team's shared collections: myCollectionsPath('team') -> '/my-collections?scope=team'
export const collectionScopeParam = 'scope';
export const myCollectionsPath = (scope?: 'own' | 'team') =>
  scope === 'team' ? `${routes.myCollections}?${new URLSearchParams({ [collectionScopeParam]: scope })}` : routes.myCollections;

// An AI Studio tool, optionally working on an earlier result: aiToolPath('upscale', 'gen-id:0') -> '/ai/tools/upscale?source=gen-id:0'
export const aiSourceParam = 'source';
export const aiToolPath = (tool: string, source?: string) =>
  `${routes.aiTool.replace(':tool', tool)}${source ? `?${new URLSearchParams({ [aiSourceParam]: source })}` : ''}`;

export const helpArticlePath = (id: string) => routes.helpArticle.replace(':id', encodeURIComponent(id));
export const learnGuidePath = (id: string) => routes.learnGuide.replace(':id', encodeURIComponent(id));

export const blogPostPath = (id: string) => routes.blogPost.replace(':id', encodeURIComponent(id));
export const coursePath = (id: string) => routes.course.replace(':id', encodeURIComponent(id));

// The blog filtered by topic: blogPath('music') -> '/blog?topic=music'
export const blogTopicParam = 'topic';
export const blogPath = (topic?: string) => (topic ? `${routes.blog}?${new URLSearchParams({ [blogTopicParam]: topic })}` : routes.blog);

// The unsubscribe page linked from newsletter emails: unsubscribePath('a@b.com') -> '/newsletter/unsubscribe?email=a%40b.com'
export const unsubscribeParam = 'email';
export const unsubscribePath = (email: string) => `${routes.unsubscribe}?${new URLSearchParams({ [unsubscribeParam]: email })}`;
