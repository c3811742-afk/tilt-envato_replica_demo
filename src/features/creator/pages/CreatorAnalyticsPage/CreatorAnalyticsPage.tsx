import { AsyncContent, Section, Stack, Table, Text } from '@/shared/components';
import { fewResultsThreshold, popularSearches, topElementsCount } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { api, formatNumber, studioApi } from '@/shared/utils';
import { CreatorArea, elementTitle } from '@/features/creator/components';

const topTerms = 10;

// "Analytics": downloads, views and favorites per element, the top elements, the searches that bring customers
// to them, and popular searches with few results (what to make next).
export const CreatorAnalyticsPage = () => {
  const { text, locale, price } = useLocale();
  const data = useAsync(async () => ({ elements: await studioApi.analytics(), gaps: await api.countResults(popularSearches) }), [], () => false);
  const t = text.studio;
  const count = (value: number) => formatNumber(value, locale);

  return (
    <CreatorArea section="analytics" title={t.analyticsTitle} subtitle={t.analyticsSubtitle}>
      <AsyncContent state={data}>
        {({ elements, gaps }) => {
          const top = [...elements].sort((a, b) => b.downloads - a.downloads).slice(0, topElementsCount);
          const terms = elements
            .flatMap((row) => row.terms.map((term) => ({ ...term, element: elementTitle(row.element, t.untitled) })))
            .sort((a, b) => b.searches - a.searches)
            .slice(0, topTerms);
          const fewResults = gaps.filter((gap) => gap.total <= fewResultsThreshold);
          return (
            <Stack gap={vars.spacing[7]}>
              {elements.length === 0 && <Text color={vars.colors.textMuted}>{t.noAnalytics}</Text>}
              {elements.length > 0 && (
                <>
                  <Section title={t.perElementTitle} variant="h3" gap={vars.spacing[3]}>
                    <Table
                      label={t.perElementTitle}
                      columns={[
                        { key: 'element', label: t.columns.element },
                        { key: 'views', label: t.columns.views, align: 'end' },
                        { key: 'downloads', label: t.columns.downloads, align: 'end' },
                        { key: 'favorites', label: t.columns.favorites, align: 'end' },
                      ]}
                      rows={elements.map((row) => ({
                        key: row.element.id,
                        cells: {
                          element: <bdi>{elementTitle(row.element, t.untitled)}</bdi>,
                          views: count(row.views),
                          downloads: count(row.downloads),
                          favorites: count(row.favorites),
                        },
                      }))}
                    />
                  </Section>
                  <Section title={t.topTitle} variant="h3" gap={vars.spacing[3]}>
                    <Table
                      label={t.topTitle}
                      columns={[
                        { key: 'element', label: t.columns.element },
                        { key: 'downloads', label: t.columns.downloads, align: 'end' },
                        { key: 'earnings', label: t.columns.earnings, align: 'end' },
                      ]}
                      rows={top.map((row) => ({
                        key: row.element.id,
                        cells: { element: <bdi>{elementTitle(row.element, t.untitled)}</bdi>, downloads: count(row.downloads), earnings: price(row.earnings) },
                      }))}
                    />
                  </Section>
                  <Section title={t.termsTitle} variant="h3" gap={vars.spacing[3]}>
                    <Table
                      label={t.termsTitle}
                      columns={[
                        { key: 'search', label: t.columns.search },
                        { key: 'element', label: t.columns.element },
                        { key: 'searches', label: t.columns.searches, align: 'end' },
                      ]}
                      rows={terms.map((term) => ({
                        key: `${term.element}-${term.term}`,
                        cells: { search: <bdi>{term.term}</bdi>, element: <bdi>{term.element}</bdi>, searches: count(term.searches) },
                      }))}
                      emptyText={t.noAnalytics}
                    />
                  </Section>
                </>
              )}
              <Section title={t.gapsTitle} subtitle={t.gapsText} variant="h3" gap={vars.spacing[3]}>
                <Table
                  label={t.gapsTitle}
                  columns={[
                    { key: 'search', label: t.columns.search },
                    { key: 'results', label: t.columns.results, align: 'end' },
                  ]}
                  rows={fewResults.map((gap) => ({ key: gap.query, cells: { search: <bdi>{gap.query}</bdi>, results: count(gap.total) } }))}
                />
              </Section>
            </Stack>
          );
        }}
      </AsyncContent>
    </CreatorArea>
  );
};
