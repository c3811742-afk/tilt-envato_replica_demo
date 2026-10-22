import { useSearchParams } from 'react-router';
import {
  businessTypes,
  defaultSort,
  filterKeys,
  filterOptions,
  listSeparator,
  occasions,
  searchParamKeys,
  searchPath,
  sortOptions,
  spotlights,
  type BusinessType,
  type MusicLinkService,
  type Occasion,
  type SortOption,
  type Spotlight,
} from '@/shared/constants';
import type { CategoryId, FilterValues, SearchQuery, SoundProfile } from '@/shared/types';
import { isCategoryId, isImageLook, isOneOf, soundProfileFromParam, soundProfileToParam } from '@/shared/utils';

export type SoundSource = MusicLinkService | 'file';
const soundSources: readonly SoundSource[] = ['youtube', 'spotify', 'file'];
const spotlightIds = Object.keys(spotlights) as Spotlight[];

export interface SearchState {
  query: string;
  categoryId?: CategoryId;
  sort: SortOption;
  filters: FilterValues;
  mustInclude: string;
  exclude: string;
  authors: string[];
  excludeAuthors: string[];
  occasion?: Occasion;
  business?: BusinessType;
  spotlight?: Spotlight;
  look?: string; // search by image
  soundsLike?: SoundProfile; // find similar music
  soundSource?: SoundSource; // what the sound profile was measured from
  page: number;
  isEmpty: boolean; // no parameter at all in the URL (the bare search page)
}

const list = (value: string | null) => (value ? value.split(listSeparator).filter(Boolean) : []);

// The search state in the current URL, and paths to the same search with some of it changed.
// Unknown values are ignored rather than breaking the page.
export const useSearchFilters = () => {
  const [params] = useSearchParams();
  const get = (key: keyof typeof searchParamKeys) => params.get(searchParamKeys[key]);
  const category = get('category');
  const sort = get('sort');
  const occasion = get('occasion');
  const business = get('business');
  const spotlight = get('spotlight');
  const look = get('look');
  const soundSource = get('soundSource');
  const page = Number(get('page'));

  const filters: FilterValues = {};
  for (const key of filterKeys) {
    const values = list(params.get(key)).filter((value) => isOneOf(value, filterOptions[key] as readonly string[]));
    if (values.length) filters[key] = values;
  }

  const state: SearchState = {
    query: get('query') ?? '',
    categoryId: isCategoryId(category) ? category : undefined,
    sort: isOneOf(sort, sortOptions) ? sort : defaultSort,
    filters,
    mustInclude: get('mustInclude') ?? '',
    exclude: get('exclude') ?? '',
    authors: list(get('authors')),
    excludeAuthors: list(get('excludeAuthors')),
    occasion: isOneOf(occasion, occasions) ? occasion : undefined,
    business: isOneOf(business, businessTypes) ? business : undefined,
    spotlight: isOneOf(spotlight, spotlightIds) ? spotlight : undefined,
    look: isImageLook(look) ? look : undefined,
    soundsLike: soundProfileFromParam(get('soundsLike')),
    soundSource: isOneOf(soundSource, soundSources) ? soundSource : undefined,
    page: Number.isInteger(page) && page > 1 ? page : 1,
    isEmpty: params.size === 0,
  };

  // The same search with some parts changed. Changing anything but the page goes back to page 1.
  const pathWith = (changes: Partial<Omit<SearchState, 'isEmpty'>>) => {
    const next = { ...state, page: 1, ...changes };
    return searchPath({
      query: next.query,
      category: next.categoryId,
      sort: next.sort === defaultSort ? undefined : next.sort,
      filters: next.filters,
      mustInclude: next.mustInclude,
      exclude: next.exclude,
      authors: next.authors,
      excludeAuthors: next.excludeAuthors,
      occasion: next.occasion,
      business: next.business,
      spotlight: next.spotlight,
      look: next.look,
      soundsLike: next.soundsLike && soundProfileToParam(next.soundsLike),
      soundSource: next.soundsLike ? next.soundSource : undefined,
      page: next.page,
    });
  };

  // What to ask the API for (paging is added by the caller).
  const query: SearchQuery = {
    query: state.query,
    categoryId: state.categoryId,
    sort: state.sort,
    filters: state.filters,
    mustInclude: state.mustInclude,
    exclude: state.exclude,
    authors: state.authors,
    excludeAuthors: state.excludeAuthors,
    occasion: state.occasion,
    business: state.business,
    spotlight: state.spotlight,
    look: state.look,
    soundsLike: state.soundsLike,
  };

  return { ...state, pathWith, searchQuery: query, searchKey: params.toString() };
};
