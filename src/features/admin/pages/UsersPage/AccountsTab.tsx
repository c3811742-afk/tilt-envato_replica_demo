import { useState } from 'react';
import { generatePath } from 'react-router';
import { fetchUsers } from '@/features/admin/api';
import { accountStatuses, accountStatusTone, userKinds } from '@/features/admin/constants';
import type { AccountStatus, UserAccount, UserKind } from '@/features/admin/types';
import { AsyncContent, Badge, Button, EmptyState, FilterBar, type RecordColumn, recordRows, Select, Stack, Table, Text, TextField, TextLink } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, isOneOf, matchesText } from '@/shared/utils';

const all = 'all';

interface AccountsTabProps {
  initialQuery?: string;
}

// Every customer and creator account, searchable by name or email.
export const AccountsTab = ({ initialQuery = '' }: AccountsTabProps) => {
  const { text, locale } = useLocale();
  const users = useAsync(fetchUsers, []);
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState<UserKind | typeof all>(all);
  const [status, setStatus] = useState<AccountStatus | typeof all>(all);
  const t = text.admin.users;

  const clearFilters = () => {
    setQuery('');
    setKind(all);
    setStatus(all);
  };

  const columns: RecordColumn<UserAccount>[] = [
    {
      key: 'name',
      label: text.admin.columns.name,
      render: (user) => (
        <Stack gap={vars.spacing[1]}>
          <TextLink to={generatePath(routes.adminUser, { userId: user.id })} autoDirection>
            {user.name}
          </TextLink>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            <bdi>{user.email}</bdi>
          </Text>
        </Stack>
      ),
    },
    {
      key: 'type',
      label: text.admin.columns.type,
      render: (user) => (
        <Stack gap={vars.spacing[1]} align="flex-start">
          <span>{t.kinds[user.kind]}</span>
          {user.source === 'site' && <Badge variant="info">{t.siteAccount}</Badge>}
        </Stack>
      ),
    },
    { key: 'joined', label: t.joined, render: (user) => formatDate(user.joinedAt, locale) },
    { key: 'plan', label: text.admin.columns.plan, render: (user) => user.planName ?? text.admin.common.none },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (user) => <Badge variant={accountStatusTone[user.status]}>{t.statuses[user.status]}</Badge>,
    },
  ];

  return (
    <AsyncContent state={users} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
      {(list) => {
        const visible = list.filter(
          (user) =>
            matchesText(query, ...[user.name, user.email]) &&
            (kind === all || user.kind === kind) &&
            (status === all || user.status === status),
        );
        return (
          <Stack>
            <FilterBar>
              <TextField
                type="search"
                label={text.admin.common.search}
                placeholder={t.searchPlaceholder}
                value={query}
                onChange={setQuery}
              />
              <Select
                label={text.admin.columns.type}
                options={[{ value: all, label: t.allKinds }, ...userKinds.map((value) => ({ value, label: t.kinds[value] }))]}
                value={kind}
                onChange={(value) => setKind(isOneOf(value, userKinds) ? value : all)}
              />
              <Select
                label={text.admin.columns.status}
                options={[
                  { value: all, label: t.allStatuses },
                  ...accountStatuses.map((value) => ({ value, label: t.statuses[value] })),
                ]}
                value={status}
                onChange={(value) => setStatus(isOneOf(value, accountStatuses) ? value : all)}
              />
            </FilterBar>
            {visible.length > 0 ? (
              <Table label={t.tabs.accounts} columns={columns} rows={recordRows(visible, (user) => user.id, columns)} stackOnMobile />
            ) : (
              <EmptyState
                title={text.admin.common.noMatchesTitle}
                message={t.noMatches}
                action={<Button onClick={clearFilters}>{text.admin.common.clearFilters}</Button>}
              />
            )}
          </Stack>
        );
      }}
    </AsyncContent>
  );
};
