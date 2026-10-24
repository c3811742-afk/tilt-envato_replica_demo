import { useState } from 'react';
import { generatePath } from 'react-router';
import { fetchReviewQueue } from '@/features/admin/api';
import { ElementSummary, RequirePermission } from '@/features/admin/components';
import { elementTypes, statusTone } from '@/features/admin/constants';
import { useFlashNotice } from '@/features/admin/hooks';
import type { CatalogElement, ElementType } from '@/features/admin/types';
import { filterQueue, type QueueFilters } from '@/features/admin/utils';
import { AsyncContent, Badge, Button, Checkbox, EmptyState, FilterBar, Notice, type RecordColumn, recordRows, SectionHeader, Select, Stack, Table, Text, TextField } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, formatNumber, isOneOf } from '@/shared/utils';

const noFilters: QueueFilters = { query: '', type: 'all', flaggedOnly: false };

const ReviewQueue = () => {
  const { text, locale } = useLocale();
  const queue = useAsync(fetchReviewQueue, []);
  const { notice, dismiss } = useFlashNotice();
  const [filters, setFilters] = useState(noFilters);
  const t = text.admin;

  const typeOptions = [
    { value: 'all', label: t.queue.allTypes },
    ...elementTypes.map((type) => ({ value: type, label: t.elementTypes[type] })),
  ];

  const columns: RecordColumn<CatalogElement>[] = [
    {
      key: 'element',
      label: t.columns.element,
      render: (element) => (
        <ElementSummary
          title={element.title}
          creatorName={element.creator.name}
          to={generatePath(routes.adminReviewElement, { elementId: element.id })}
        />
      ),
    },
    { key: 'type', label: t.columns.type, render: (element) => t.elementTypes[element.type] },
    { key: 'category', label: t.columns.category, render: (element) => text.categories[element.category].name },
    { key: 'submitted', label: t.columns.submitted, render: (element) => formatDate(element.submittedAt, locale) },
    {
      key: 'status',
      label: t.columns.status,
      render: (element) => (
        <Stack gap={vars.spacing[1]} align="flex-start">
          <Badge variant={statusTone[element.status]}>{t.statuses[element.status]}</Badge>
          {element.version > 1 && <Badge variant="warning">{t.queue.resubmitted}</Badge>}
          {element.flag && <Badge variant="danger">{t.queue.flagged}</Badge>}
        </Stack>
      ),
    },
  ];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.queue.title} subtitle={t.queue.description} />
      {notice && (
        <Notice tone="success" onDismiss={dismiss}>
          {t.notices[notice]}
        </Notice>
      )}
      <AsyncContent
        state={queue}
        empty={<EmptyState title={t.queue.emptyTitle} message={t.queue.emptyMessage} />}
      >
        {(elements) => {
          const visible = filterQueue(elements, filters);
          return (
            <Stack>
              <FilterBar>
                <TextField
                  type="search"
                  label={t.common.search}
                  placeholder={t.common.searchPlaceholder}
                  value={filters.query}
                  onChange={(query) => setFilters({ ...filters, query })}
                />
                <Select
                  label={t.queue.typeLabel}
                  options={typeOptions}
                  value={filters.type}
                  onChange={(type) =>
                    setFilters({ ...filters, type: isOneOf<ElementType>(type, elementTypes) ? type : 'all' })
                  }
                />
                <Checkbox
                  label={t.queue.flaggedOnly}
                  checked={filters.flaggedOnly}
                  onChange={(flaggedOnly) => setFilters({ ...filters, flaggedOnly })}
                />
              </FilterBar>
              <Text color={vars.colors.textMuted}>
                {fillText(t.queue.count, { count: formatNumber(elements.length, locale) })}
              </Text>
              {visible.length > 0 ? (
                <Table
                  label={t.queue.tableLabel}
                  columns={columns} rows={recordRows(visible, (element) => element.id, columns)} stackOnMobile
                 
                 
                />
              ) : (
                <EmptyState
                  title={t.common.noMatchesTitle}
                  message={t.queue.noMatchesMessage}
                  action={<Button onClick={() => setFilters(noFilters)}>{t.common.clearFilters}</Button>}
                />
              )}
            </Stack>
          );
        }}
      </AsyncContent>
    </Stack>
  );
};

export const ReviewQueuePage = () => (
  <RequirePermission permission="review">
    <ReviewQueue />
  </RequirePermission>
);
