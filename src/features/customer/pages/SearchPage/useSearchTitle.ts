import { useLocale, type useSearchFilters } from '@/shared/hooks';
import { fillText } from '@/shared/utils';

// The search page heading: what the user searched or browsed.
export const useSearchTitle = (search: ReturnType<typeof useSearchFilters>) => {
  const { text } = useLocale();
  if (search.query) return fillText(text.search.resultsFor, { query: search.query });
  if (search.look) return text.search.imageActive;
  if (search.soundsLike) return fillText(text.search.soundActive, { source: text.musicMatch.sources[search.soundSource ?? 'file'] });
  if (search.occasion) return text.browse.occasions[search.occasion];
  if (search.business) return text.browse.businesses[search.business];
  if (search.spotlight) return text.browse.spotlights[search.spotlight];
  if (search.categoryId) return text.categories[search.categoryId].name;
  return text.search.allItems;
};
