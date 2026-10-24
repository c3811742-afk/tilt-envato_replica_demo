import { useNavigate } from 'react-router';
import { Chip, Icon, Stack, TextLink } from '@/shared/components';
import { filterKeys, searchPath } from '@/shared/constants';
import { useAsync, useLocale, type useSearchFilters } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { api, fillText, formatDate } from '@/shared/utils';

// The custom upload date range as one chip: "Uploaded in 2026", "Uploaded 1 Mar 2026 to 30 Jun 2026"…
const uploadRangeFilter = (
  search: ReturnType<typeof useSearchFilters>,
  text: ReturnType<typeof useLocale>['text'],
  locale: ReturnType<typeof useLocale>['locale'],
): ActiveFilter[] => {
  const { uploadedFrom: from, uploadedTo: to } = search;
  if (!from && !to) return [];
  const sameYear = from?.endsWith('-01-01') && to?.endsWith('-12-31') && from.slice(0, 4) === to.slice(0, 4);
  const label = sameYear
    ? fillText(text.search.uploadedIn, { year: from?.slice(0, 4) ?? '' })
    : from && to
      ? fillText(text.search.uploadedBetween, { from: formatDate(from, locale), to: formatDate(to, locale) })
      : from
        ? fillText(text.search.uploadedSince, { from: formatDate(from, locale) })
        : fillText(text.search.uploadedUntil, { to: formatDate(to ?? '', locale) });
  return [{ key: 'uploaded', label, path: search.pathWith({ uploadedFrom: undefined, uploadedTo: undefined }) }];
};

interface ActiveFilter {
  key: string;
  label: string;
  path: string; // the search without this filter
}

// Everything that narrows the results, each removable, and "Clear all" (keeps the query and category).
export const ActiveFilters = ({ search }: { search: ReturnType<typeof useSearchFilters> }) => {
  const { text, locale } = useLocale();
  const navigate = useNavigate();
  const needsCreators = search.authors.length > 0 || search.excludeAuthors.length > 0;
  const creators = useAsync(() => (needsCreators ? api.getCreators() : Promise.resolve([])), [needsCreators]);
  const creatorNames = (ids: string[]) =>
    ids.map((id) => (creators.status === 'success' ? creators.data.find((creator) => creator.id === id)?.name : undefined) ?? id).join(', ');

  const active: ActiveFilter[] = [
    ...filterKeys.flatMap((key) =>
      (search.filters[key] ?? []).map((value) => ({
        key: `${key}-${value}`,
        label: (text.filters[key].options as Record<string, string>)[value],
        path: search.pathWith({ filters: { ...search.filters, [key]: search.filters[key]?.filter((selected) => selected !== value) } }),
      })),
    ),
    ...(search.occasion ? [{ key: 'occasion', label: text.browse.occasions[search.occasion], path: search.pathWith({ occasion: undefined }) }] : []),
    ...(search.business ? [{ key: 'business', label: text.browse.businesses[search.business], path: search.pathWith({ business: undefined }) }] : []),
    ...(search.spotlight ? [{ key: 'spotlight', label: text.browse.spotlights[search.spotlight], path: search.pathWith({ spotlight: undefined }) }] : []),
    ...(search.mustInclude
      ? [{ key: 'must', label: fillText(text.search.mustInclude, { words: search.mustInclude }), path: search.pathWith({ mustInclude: '' }) }]
      : []),
    ...(search.exclude ? [{ key: 'exclude', label: fillText(text.search.excluding, { words: search.exclude }), path: search.pathWith({ exclude: '' }) }] : []),
    ...(search.authors.length
      ? [{ key: 'authors', label: fillText(text.search.byAuthors, { authors: creatorNames(search.authors) }), path: search.pathWith({ authors: [] }) }]
      : []),
    ...(search.excludeAuthors.length
      ? [
          {
            key: 'excludeAuthors',
            label: fillText(text.search.notByAuthors, { authors: creatorNames(search.excludeAuthors) }),
            path: search.pathWith({ excludeAuthors: [] }),
          },
        ]
      : []),
    ...uploadRangeFilter(search, text, locale),
    ...(search.look ? [{ key: 'look', label: text.search.imageActive, path: search.pathWith({ look: undefined }) }] : []),
    ...(search.soundsLike
      ? [
          {
            key: 'sound',
            label: fillText(text.search.soundActive, { source: text.musicMatch.sources[search.soundSource ?? 'file'] }),
            path: search.pathWith({ soundsLike: undefined, soundSource: undefined }),
          },
        ]
      : []),
  ];

  if (!active.length) return null;

  return (
    <Stack direction="row" wrap align="center" gap={vars.spacing[2]} ariaLabel={text.search.activeFilters}>
      {active.map((filter) => (
        <Chip key={filter.key} selected onClick={() => navigate(filter.path)}>
          <span dir="auto">{filter.label}</span>
          <Icon name="close" size={vars.sizes.icon.sm} label={fillText(text.search.removeFilter, { filter: filter.label })} />
        </Chip>
      ))}
      <TextLink variant="bodySm" onClick={() => navigate(searchPath({ query: search.query, category: search.categoryId }))}>
        {text.filters.clearAll}
      </TextLink>
    </Stack>
  );
};
