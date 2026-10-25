export const storageKeys = {
  locale: 'tilt.locale',
  language: 'tilt.language', // the chosen language, when it's one the team added (its layout follows `locale`)
  addedLanguages: 'tilt.addedLanguages', // languages the team added in the admin, besides English and Arabic
  announcements: 'tilt.announcements', // announcements the admin team sent or scheduled
  payoutRules: 'tilt.payoutRules', // how creators are paid, as the admin team set it
  hiddenLocales: 'tilt.hiddenLocales', // English or Arabic, when the team took it out of the site's language menu
  modePreference: 'tilt.modePreference', // light / dark / system
  accentTheme: 'tilt.accentTheme',
  cookieConsent: 'tilt.cookieConsent', // which optional cookies the user allowed
  accounts: 'tilt.accounts', // demo "server": every account created in this browser
  licenses: 'tilt.licenses', // demo license server: every license issued in this browser
  catalogEvents: 'tilt.catalogEvents', // demo: items removed from the library, items creators published
  teams: 'tilt.teams', // demo: every team (members, invites, shared collections)
  newsletter: 'tilt.newsletter', // demo: email addresses signed up for the newsletter
  applications: 'tilt.applications', // demo: author and partner program applications
  plans: 'tilt.plans', // the plans as the admin team last saved them (prices, limits, on sale or not)
  promoCodes: 'tilt.promoCodes', // promo codes the admin team created
  faqs: 'tilt.faqs', // the FAQ page, as the admin team last saved it
  legalPages: 'tilt.legalPages', // terms, privacy policy and license terms, as the admin team last saved them
  articles: 'tilt.articles', // Help Center, Learn and What's new, as the admin team last saved them
  textEdits: 'tilt.textEdits', // corrections to the site's text made in the admin's translations, per language
  categorySettings: 'tilt.categorySettings', // the categories' order and the hidden ones, set in the admin
  tagEdits: 'tilt.tagEdits', // tags the admin team renamed, merged or banned
  aiSettings: 'tilt.aiSettings', // AI tools on or off, by plan, credit costs and content rules, set in the admin
  aiBlocked: 'tilt.aiBlocked', // AI Studio prompts that were blocked by the content rules
  searchReports: 'tilt.searchReports', // "Report these results" from the search page, for the admin team
  emptySearches: 'tilt.emptySearches', // searches that found nothing, for the admin's search insights
  programs: 'tilt.programs', // student programs and competitions, set up in the admin
  homepage: 'tilt.homepage', // featured items, free items, occasions and banners, as the admin team last saved them
  sessionUserId: 'tilt.sessionUserId', // the signed-in account
  localeChosen: 'tilt.localeChosen', // the user picked a language themselves (no more suggestions)
  languageSuggestionDismissed: 'tilt.languageSuggestionDismissed',
  currency: 'tilt.currency', // the currency prices are shown in
  gridSize: 'tilt.gridSize', // search results grid size
  pagingMode: 'tilt.pagingMode', // infinite scroll or pages
  filtersCollapsed: 'tilt.filtersCollapsed', // the search filters panel is folded (desktop)
  fontView: 'tilt.fontView', // fonts as a grid or a list of samples
  volume: 'tilt.volume', // one volume for every preview
  creatorOnboarding: 'tilt.creatorOnboarding', // the creator application in progress
  studioElements: 'tilt.studioElements', // demo: creators' elements, from draft to live
  studioPayouts: 'tilt.studioPayouts', // demo: payouts creators asked for
  studioClaims: 'tilt.studioClaims', // demo: copyright claims against creators' elements
  adminSession: 'tilt.admin.session', // demo only: the admin picked in the "Signed in as" switch
} as const;
