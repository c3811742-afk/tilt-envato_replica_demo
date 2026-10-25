// Cookie groups the user can allow. "necessary" is always on: the site can't work without it.
export const cookieCategories = ['necessary', 'analytics', 'marketing'] as const;
export type CookieCategory = (typeof cookieCategories)[number];

export const optionalCookieCategories = ['analytics', 'marketing'] as const satisfies readonly CookieCategory[];
export type OptionalCookieCategory = (typeof optionalCookieCategories)[number];
