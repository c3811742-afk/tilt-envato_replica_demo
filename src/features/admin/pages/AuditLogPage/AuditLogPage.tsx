import { useState } from 'react';
import { fetchAuditLog } from '@/features/admin/api';
import {
  Badge,
  DataTable,
  FilterBar,
  PageHeader,
  RequirePermission,
  SelectField,
  Stack,
  type DataTableColumn,
} from '@/features/admin/components';
import { auditActions, auditActionTone } from '@/features/admin/constants';
import type { AuditAction, AuditEntry } from '@/features/admin/types';
import { describeAuditDetails, isOneOf, localized } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';

const allValues = 'all';
const dateTime: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

// Each admin who appears in the log, once.
const actorsIn = (entries: AuditEntry[]) =>
  [...new Map(entries.map((entry) => [entry.actorId, entry.actorName])).entries()].map(([id, name]) => ({
    value: id,
    label: name,
  }));

const AuditLog = () => {
  const { text, locale } = useLocale();
  const log = useAsync(fetchAuditLog, []);
  const [action, setAction] = useState<AuditAction | typeof allValues>(allValues);
  const [actorId, setActorId] = useState<string>(allValues);
  const t = text.admin;

  const clearFilters = () => {
    setAction(allValues);
    setActorId(allValues);
  };

  const columns: DataTableColumn<AuditEntry>[] = [
    { key: 'time', header: t.columns.time, render: (entry) => formatDate(entry.at, locale, dateTime) },
    {
      key: 'admin',
      header: t.columns.admin,
      render: (entry) => (
        <Text as="span" autoDirection>
          {entry.actorName}
        </Text>
      ),
    },
    {
      key: 'action',
      header: t.columns.action,
      render: (entry) => <Badge tone={auditActionTone[entry.action]}>{t.audit.actions[entry.action]}</Badge>,
    },
    {
      key: 'target',
      header: t.columns.target,
      render: (entry) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            {entry.target.labels ? localized(entry.target.labels, locale) : entry.target.label}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {t.audit.targets[entry.target.kind]}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'details',
      header: t.columns.details,
      render: (entry) => (
        <Stack gap={vars.spacing[1]}>
          {describeAuditDetails(entry, text, locale).map((line) => (
            <Text key={line} as="span" variant="bodySm">
              {line}
            </Text>
          ))}
        </Stack>
      ),
    },
  ];

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.audit.title} description={t.audit.description} />
      <AsyncContent state={log} empty={<EmptyState title={t.audit.emptyTitle} message={t.audit.emptyMessage} />}>
        {(entries) => {
          const visible = entries.filter(
            (entry) =>
              (action === allValues || entry.action === action) && (actorId === allValues || entry.actorId === actorId),
          );
          return (
            <Stack>
              <FilterBar>
                <SelectField
                  label={t.audit.actionLabel}
                  options={[
                    { value: allValues, label: t.audit.allActions },
                    ...auditActions.map((value) => ({ value, label: t.audit.actions[value] })),
                  ]}
                  value={action}
                  onChange={(value) => setAction(isOneOf(auditActions, value) ? value : allValues)}
                />
                <SelectField
                  label={t.audit.adminLabel}
                  options={[{ value: allValues, label: t.audit.allAdmins }, ...actorsIn(entries)]}
                  value={actorId}
                  onChange={setActorId}
                />
              </FilterBar>
              {visible.length > 0 ? (
                <DataTable label={t.audit.tableLabel} columns={columns} rows={visible} getRowKey={(entry) => entry.id} />
              ) : (
                <EmptyState
                  title={t.common.noMatchesTitle}
                  message={t.audit.noMatchesMessage}
                  action={<Button onClick={clearFilters}>{t.common.clearFilters}</Button>}
                />
              )}
            </Stack>
          );
        }}
      </AsyncContent>
    </Stack>
  );
};

export const AuditLogPage = () => (
  <RequirePermission permission="viewAuditLog">
    <AuditLog />
  </RequirePermission>
);
