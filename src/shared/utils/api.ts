import { catalog, spotlights, type SortOption } from '@/shared/constants';
import { mockCategories, mockCollections, mockCreators, mockDownloadedTogether, mockItems as allItems, mockPasses, mockPlans } from '@/shared/mocks';
import type {
  CatalogStats,
  Category,
  CategoryId,
  CollectionWithItems,
  Collection,
  Creator,
  CreatorProfile,
  Item,
  ProjectPass,
  Page,
  Plan,
  SearchQuery,
  SearchReport,
  SearchResults,
  SearchSuggestion,
} from '@/shared/types';
import { applyFilters, countFacets } from './filters';
import { lookDistance } from './imageLook';
import { readCatalogEvents } from './accountStore';
import { respond } from './mockResponse';
import { byTrending, findDownloadedTogether, findSimilarItems, isEmptyQuery, matchItems, parseQuery, sortItems, sortScored } from './search';
import { itemSoundProfile, soundDistance } from './soundProfile';
import { suggestSearches } from './suggestions';

// Items with the demo's catalog events applied: a creator's newly published item is new; removed items are marked.
const withEvents = (item: Item): Item => {
  const { publishedAt, removedItemIds } = readCatalogEvents();
  return { ...item, createdAt: publishedAt[item.id] ?? item.createdAt, removedAt: removedItemIds[item.id] };
};

// The items people can browse: removed items are left out (licensed users still reach them by link).
const catalogItems = () => allItems.map(withEvents).filter((item) => !item.removedAt);

const categoriesWithCounts = (): Category[] =>
  mockCategories.map((category) => ({
    ...category,
    itemCount: catalogItems().filter((item) => item.categoryId === category.id).length,
  }));

const creators: Creator[] = Object.values(mockCreators);

const withItems = (collection: Collection): CollectionWithItems => ({
  ...collection,
  items: collection.itemIds.map((id) => catalogItems().find((item) => item.id === id)).filter((item): item is Item => item !== undefined),
  creator: creators.find((creator) => creator.id === collection.creatorId),
});

// Items a search starts from: the category, browse section and advanced-search authors narrow it down.
const searchBase = ({ categoryId, occasion, business, spotlight, authors, excludeAuthors, uploadedFrom, uploadedTo }: SearchQuery) =>
  catalogItems().filter(
    (item) =>
      (!categoryId || item.categoryId === categoryId) &&
      (!occasion || item.occasions.includes(occasion)) &&
      (!business || item.businesses.includes(business)) &&
      (!spotlight || (item.local && (spotlights[spotlight].categoryIds as readonly CategoryId[]).includes(item.categoryId))) &&
      (!authors?.length || authors.includes(item.creator.id)) &&
      !excludeAuthors?.includes(item.creator.id) &&
      // ISO dates compare as text: "2026-03-01" < "2026-10-22".
      (!uploadedFrom || item.createdAt >= uploadedFrom) &&
      (!uploadedTo || item.createdAt <= uploadedTo),
  );

// Items in result order: by text match, by look (search by image) or by sound (find similar music).
const rankResults = (query: SearchQuery): Item[] => {
  const base = searchBase(query);
  const parsed = parseQuery(query.query, query.mustInclude, query.exclude);
  const matched = isEmptyQuery(parsed)
    ? base.map((item) => ({ item, matched: 0, score: 0 }))
    : matchItems(base, mockCategories, parsed);

  const { look, soundsLike, sort } = query;
  if (look) {
    const byLook = matched
      .flatMap(({ item }) => (item.look ? [{ item, distance: lookDistance(look, item.look) }] : []))
      .filter(({ distance }) => distance <= catalog.imageMatchMaxDistance);
    return sort && sort !== 'relevant'
      ? sortScored(byLook.map(({ item }) => ({ item, matched: 0, score: 0 })), sort)
      : byLook.sort((a, b) => a.distance - b.distance).map(({ item }) => item);
  }
  if (soundsLike) {
    const bySound = matched
      .flatMap(({ item }) => {
        const profile = itemSoundProfile(item);
        return profile ? [{ item, distance: soundDistance(soundsLike, profile) }] : [];
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, catalog.soundMatchLimit);
    return sort && sort !== 'relevant'
      ? sortScored(bySound.map(({ item }) => ({ item, matched: 0, score: 0 })), sort)
      : bySound.map(({ item }) => item);
  }
  return sortScored(matched, sort);
};

export const api = {
  getCategories: (): Promise<Category[]> => respond(categoriesWithCounts()),

  // A page of search results, with how many results each filter option would have.
  searchItems: (query: SearchQuery): Promise<SearchResults> => {
    const { filters = {}, offset = 0, limit = catalog.searchPageSize } = query;
    const now = Date.now();
    const ranked = rankResults(query);
    const results = applyFilters(ranked, filters, now);
    return respond({
      items: results.slice(offset, offset + limit),
      total: results.length,
      facets: countFacets(ranked, filters, now),
    });
  },

  // The first `limit` items in an order, e.g. the home page rows.
  getItems: (sort: SortOption, limit: number = catalog.railSize, categoryId?: CategoryId): Promise<Item[]> =>
    respond(sortItems(searchBase({ categoryId }), sort).slice(0, limit)),

  getFeaturedItems: (limit: number = catalog.railSize): Promise<Item[]> =>
    respond(catalogItems().filter((item) => item.featured).slice(0, limit)),

  // Most downloaded in the last 30 days.
  getTrendingItems: (limit: number = catalog.railSize): Promise<Item[]> =>
    respond([...catalogItems()].sort(byTrending).slice(0, limit)),

  // This month's free items: anyone with an account can download them.
  getFreeItems: (limit: number = catalog.railSize): Promise<Item[]> =>
    respond(catalogItems().filter((item) => item.tier === 'free').slice(0, limit)),

  // Items from a home page browse section: an occasion, a business type or a local spotlight.
  getBrowseItems: (query: Pick<SearchQuery, 'occasion' | 'business' | 'spotlight'>, limit: number = catalog.railSize) =>
    respond(sortItems(searchBase(query), 'popular').slice(0, limit)),

  // Items by id, in the order given (e.g. saved items). Ids that no longer exist are left out.
  getItemsByIds: (ids: readonly string[]): Promise<Item[]> =>
    respond(ids.map((id) => catalogItems().find((item) => item.id === id)).filter((item): item is Item => item !== undefined)),

  // null when no item has this id (the page shows "Item not found").
  getItem: (id: string): Promise<Item | null> => {
    const item = allItems.find((candidate) => candidate.id === id);
    return respond(item ? withEvents(item) : null);
  },

  getSimilarItems: (item: Item, limit: number = catalog.similarSize): Promise<Item[]> =>
    respond(findSimilarItems(catalogItems(), item, limit)),

  getDownloadedTogether: (item: Item, limit: number = catalog.downloadedTogetherSize): Promise<Item[]> =>
    respond(findDownloadedTogether(catalogItems(), mockDownloadedTogether, item, limit)),

  // A creator's portfolio, most popular first. `excludeId` leaves out the item being viewed.
  getCreatorItems: (
    creatorId: string,
    { offset = 0, limit = catalog.creatorProfileSize, excludeId }: { offset?: number; limit?: number; excludeId?: string } = {},
  ): Promise<Page<Item>> => {
    const items = sortItems(
      catalogItems().filter((item) => item.creator.id === creatorId && item.id !== excludeId),
      'popular',
    );
    return respond({ items: items.slice(offset, offset + limit), total: items.length });
  },

  // null when no creator has this id.
  getCreator: (id: string): Promise<CreatorProfile | null> => {
    const creator = creators.find((candidate) => candidate.id === id);
    if (!creator) return respond(null);
    const items = catalogItems().filter((item) => item.creator.id === id);
    return respond({
      creator,
      itemCount: items.length,
      downloads: items.reduce((total, item) => total + item.downloads, 0),
    });
  },

  getCreators: (): Promise<Creator[]> => respond([...creators].sort((a, b) => a.name.localeCompare(b.name))),

  getCollections: (): Promise<CollectionWithItems[]> => respond(mockCollections.map(withItems)),

  // null when no collection has this id.
  getCollection: (id: string): Promise<CollectionWithItems | null> => {
    const collection = mockCollections.find((candidate) => candidate.id === id);
    return respond(collection ? withItems(collection) : null);
  },

  getSuggestions: (typed: string): Promise<SearchSuggestion[]> =>
    respond(suggestSearches(typed, catalogItems(), categoriesWithCounts(), catalog.suggestionLimit), catalog.suggestLatencyMs),

  // "These results don't match my search": the demo keeps nothing on a server.
  reportSearch: (report: SearchReport): Promise<SearchReport> => respond(report),

  getPlans: (): Promise<Plan[]> => respond(mockPlans),

  getPasses: (): Promise<ProjectPass[]> => respond(mockPasses),

  getStats: (): Promise<CatalogStats> =>
    respond({
      itemCount: catalogItems().length,
      creatorCount: creators.length,
      categoryCount: mockCategories.length,
    }),
};
