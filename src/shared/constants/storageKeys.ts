export const storageKeys = {
  locale: 'tilt.locale',
  modePreference: 'tilt.modePreference', // light / dark / system
  accentTheme: 'tilt.accentTheme',
  cookieConsent: 'tilt.cookieConsent', // which optional cookies the user allowed
  accounts: 'tilt.accounts', // demo "server": every account created in this browser
  sessionUserId: 'tilt.sessionUserId', // the signed-in account
  localeChosen: 'tilt.localeChosen', // the user picked a language themselves (no more suggestions)
  languageSuggestionDismissed: 'tilt.languageSuggestionDismissed',
  currency: 'tilt.currency', // the currency prices are shown in
  gridSize: 'tilt.gridSize', // search results grid size
  pagingMode: 'tilt.pagingMode', // infinite scroll or pages
  fontView: 'tilt.fontView', // fonts as a grid or a list of samples
  volume: 'tilt.volume', // one volume for every preview
} as const;
