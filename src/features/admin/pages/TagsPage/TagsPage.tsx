import { useState } from 'react';
import { fetchTags, setTagBanned } from '@/features/admin/api';
import {
  Badge,
  ConfirmModal,
  DataTable,
  FilterBar,
  Notice,
  PageHeader,
  RequirePermission,
  SelectField,
  Stack,
  TextField,
  type DataTableColumn,
} from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Tag } from '@/features/admin/types';
import { fillText, isOneOf, isolate, matchesQuery } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';
import { MergeTagModal } from './MergeTagModal';
import { RenameTagModal } from './RenameTagModal';

const tagFilters = ['all', 'allowed', 'banned'] as const;
type TagFilter = (typeof tagFilters)[number];

type TagDialog = { kind: 'rename' | 'merge' | 'ban'; tag: Tag };

const Tags = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const tags = useAsync(fetchTags, []);
  const action = useAdminAction();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TagFilter>('all');
  const [dialog, setDialog] = useState<TagDialog | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.tags;

  const done = (list: Tag[], message: string) => {
    tags.update(list);
    setDialog(null);
    setNotice(message);
  };

  const setBanned = async (tag: Tag, banned: boolean) => {
    setNotice(null);
    const result = await action.run(() => setTagBanned(currentAdmin.id, tag.id, banned));
    if (result.ok) done(result.data, fillText(banned ? t.bannedNotice : t.unbannedNotice, { name: isolate(tag.name) }));
  };

  const openDialog = (next: TagDialog) => {
    action.clearError();
    setDialog(next);
  };

  const columns: DataTableColumn<Tag>[] = [
    {
      key: 'tag',
      header: text.admin.columns.tag,
      render: (tag) => (
        <Stack direction="row" gap={vars.spacing[2]} align="center">
          <Text as="span" autoDirection>
            {tag.name}
          </Text>
          {tag.banned && <Badge tone="danger">{t.bannedBadge}</Badge>}
        </Stack>
      ),
    },
    { key: 'usage', header: text.admin.columns.usage, render: (tag) => formatNumber(tag.usage, locale) },
    {
      key: 'actions',
      header: text.admin.columns.actions,
      render: (tag) =>
        tag.banned ? (
          <Button size="sm" variant="muted" disabled={action.pending} onClick={() => setBanned(tag, false)}>
            {t.unban}
          </Button>
        ) : (
          <Stack direction="row" gap={vars.spacing[2]}>
            <Button size="sm" variant="muted" onClick={() => openDialog({ kind: 'rename', tag })}>
              {t.rename}
            </Button>
            <Button size="sm" variant="muted" onClick={() => openDialog({ kind: 'merge', tag })}>
              {t.merge}
            </Button>
            <Button size="sm" variant="danger" onClick={() => openDialog({ kind: 'ban', tag })}>
              {t.ban}
            </Button>
          </Stack>
        ),
    },
  ];

  const clearFilters = () => {
    setQuery('');
    setFilter('all');
  };

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.title} description={t.description} />
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {action.error && !dialog && (
        <Notice tone="danger" onDismiss={action.clearError}>
          {action.error}
        </Notice>
      )}
      <AsyncContent state={tags} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
        {(list) => {
          const visible = list.filter(
            (tag) =>
              matchesQuery(query, [tag.name]) &&
              (filter === 'all' || (filter === 'banned') === tag.banned),
          );
          return (
            <Stack>
              <FilterBar>
                <TextField type="search" label={t.searchLabel} value={query} onChange={setQuery} autoDirection />
                <SelectField
                  label={t.filterLabel}
                  options={tagFilters.map((value) => ({ value, label: t.filters[value] }))}
                  value={filter}
                  onChange={(value) => isOneOf(tagFilters, value) && setFilter(value)}
                />
              </FilterBar>
              <Text color={vars.colors.textMuted}>{fillText(t.count, { count: formatNumber(list.length, locale) })}</Text>
              {visible.length > 0 ? (
                <DataTable label={t.title} columns={columns} rows={visible} getRowKey={(tag) => tag.id} />
              ) : (
                <EmptyState
                  title={text.admin.common.noMatchesTitle}
                  message={t.noMatchesMessage}
                  action={<Button onClick={clearFilters}>{text.admin.common.clearFilters}</Button>}
                />
              )}
              {dialog?.kind === 'rename' && (
                <RenameTagModal
                  tag={dialog.tag}
                  onClose={() => setDialog(null)}
                  onSaved={(saved, name) => done(saved, fillText(t.renamedNotice, { name: isolate(name) }))}
                />
              )}
              {dialog?.kind === 'merge' && (
                <MergeTagModal
                  tag={dialog.tag}
                  tags={list}
                  onClose={() => setDialog(null)}
                  onMerged={(saved, target) =>
                    done(
                      saved,
                      fillText(t.mergedNotice, { source: isolate(dialog.tag.name), target: isolate(target.name) }),
                    )
                  }
                />
              )}
            </Stack>
          );
        }}
      </AsyncContent>
      {dialog?.kind === 'ban' && (
        <ConfirmModal
          title={t.banTitle}
          confirmLabel={t.ban}
          tone="danger"
          message={fillText(t.banMessage, { count: formatNumber(dialog.tag.usage, locale) })}
          pending={action.pending}
          error={action.error}
          onConfirm={() => setBanned(dialog.tag, true)}
          onClose={() => setDialog(null)}
        >
          <Text autoDirection>
            <strong>{dialog.tag.name}</strong>
          </Text>
        </ConfirmModal>
      )}
    </Stack>
  );
};

export const TagsPage = () => (
  <RequirePermission permission="manageCatalog">
    <Tags />
  </RequirePermission>
);
