import { optionalCookieCategories, type OptionalCookieCategory } from '@/shared/constants';

// Every optional cookie group set to the same answer ("Accept all" / "Reject all").
export const allOptionalCookies = (allowed: boolean) =>
  Object.fromEntries(optionalCookieCategories.map((category) => [category, allowed])) as Record<
    OptionalCookieCategory,
    boolean
  >;
