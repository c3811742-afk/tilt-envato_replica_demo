import { Link, useNavigate, useSearchParams } from 'react-router';
import { searchEverything } from '@/features/admin/api';
import { adminNav } from '@/features/admin/constants';
import { useAdminSession } from '@/features/admin/hooks';
import type { AdminSearchResult } from '@/features/admin/types';
import { fillText, localized, matchesQuery } from '@/features/admin/utils';
import { AsyncContent, Card, EmptyState, SearchBar, SectionHeader, Stack, Text } from '@/shared/components';
import { routes, texts } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';
import styles from './SearchPage.module.css';

// One found thing: its name (in the page's language when it has two) and a second line, linking to where it's handled.
const ResultLink = ({ result }: { result: AdminSearchResult }) => {
  const { locale } = useLocale();
  return (
    <Link to={result.to} className={styles.result}>
      <Text as="span" variant="title" autoDirection>
        {result.titles ? localized(result.titles, locale) : result.title}
      </Text>
      {result.detail && (
        <Text as="span" variant="bodySm" color={vars.colors.textMuted} autoDirection>
          {result.detail}
        </Text>
      )}
    </Link>
  );
};

// Search across the admin: pages, people, elements, tickets, payments... Only what this admin's role can open.
export const SearchPage = () => {
  const { text, locale } = useLocale();
  const { currentAdmin, can } = useAdminSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = params.get('q')?.trim() ?? '';
  const t = text.admin.searchAll;
  const results = useAsync(() => searchEverything(currentAdmin.id, query), [query, currentAdmin.id], (data) => data.groups.length === 0);

  // Admin pages whose name matches, in either language.
  const pages: AdminSearchResult[] = query
    ? adminNav
        .filter((item) => can(item.permission))
        .filter((item) => matchesQuery(query, [texts.en.admin.nav[item.key], texts.ar.admin.nav[item.key]]))
        .map((item) => ({ group: 'pages', id: item.key, title: text.admin.nav[item.key], to: item.to }))
    : [];

  const search = (next: string) => navigate({ pathname: routes.adminSearch, search: next ? `?${new URLSearchParams({ q: next })}` : '' });

  const group = (key: AdminSearchResult['group'], list: AdminSearchResult[], total: number) => (
    <Card key={key} as="section" title={t.groups[key]} gap={vars.spacing[3]}>
      <Text variant="bodySm" color={vars.colors.textMuted}>
        {fillText(total > list.length ? t.countShown : t.count, {
          count: formatNumber(total, locale),
          shown: formatNumber(list.length, locale),
        })}
      </Text>
      <ul className={styles.list}>
        {list.map((result) => (
          <li key={`${result.group}-${result.id}`}>
            <ResultLink result={result} />
          </li>
        ))}
      </ul>
    </Card>
  );

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={query ? fillText(t.resultsFor, { query }) : t.description} />
      <SearchBar key={query} defaultValue={query} suggest={false} placeholder={t.placeholder} label={t.label} onSearch={search} />
      {!query ? (
        <EmptyState title={t.startTitle} message={t.startMessage} />
      ) : (
        <AsyncContent
          state={results}
          empty={
            pages.length > 0 ? (
              <div className={styles.groups}>{group('pages', pages, pages.length)}</div>
            ) : (
              <EmptyState title={t.noneTitle} message={fillText(t.noneMessage, { query })} />
            )
          }
        >
          {(data) => (
            <div className={styles.groups}>
              {pages.length > 0 && group('pages', pages, pages.length)}
              {data.groups.map((found) => group(found.group, found.results, found.total))}
            </div>
          )}
        </AsyncContent>
      )}
    </Stack>
  );
};
