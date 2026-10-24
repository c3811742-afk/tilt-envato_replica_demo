import { useState } from 'react';
import { closeSearchReport, fetchSearchReports } from '@/features/admin/api';
import {
  Badge,
  DataTable,
  FilterBar,
  Notice,
  SelectField,
  Stack,
  type DataTableColumn,
} from '@/features/admin/components';
import { reportStatuses, reportStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { ReportResolution, ReportStatus, SearchReport } from '@/features/admin/types';
import { fillText, isOneOf, isolate, replaceById } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';

const allStatuses = 'all';

// Customer reports that a result doesn't match the search. Resolving hides the element from that search.
export const ReportsTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const reports = useAsync(fetchSearchReports, []);
  const action = useAdminAction();
  const [status, setStatus] = useState<ReportStatus | typeof allStatuses>('open');
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.search.reports;

  const close = async (list: SearchReport[], report: SearchReport, resolution: ReportResolution) => {
    setNotice(null);
    const result = await action.run(() => closeSearchReport(currentAdmin.id, report.id, resolution));
    if (!result.ok) return;
    reports.update(replaceById(list, result.data));
    const values = { title: isolate(report.element.title), term: isolate(report.term) };
    setNotice(fillText(resolution === 'resolved' ? t.resolvedNotice : t.dismissedNotice, values));
  };

  const columns = (list: SearchReport[]): DataTableColumn<SearchReport>[] => [
    {
      key: 'term',
      header: text.admin.columns.term,
      render: (report) => (
        <Text as="span" autoDirection>
          {report.term}
        </Text>
      ),
    },
    {
      key: 'element',
      header: text.admin.columns.element,
      render: (report) => (
        <Text as="span" autoDirection>
          {report.element.title}
        </Text>
      ),
    },
    {
      key: 'report',
      header: text.admin.columns.report,
      render: (report) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            {report.note}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {fillText(t.reportedBy, { name: isolate(report.reportedBy), date: formatDate(report.reportedAt, locale) })}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'status',
      header: text.admin.columns.status,
      render: (report) => <Badge tone={reportStatusTone[report.status]}>{t.statuses[report.status]}</Badge>,
    },
    {
      key: 'actions',
      header: text.admin.columns.actions,
      render: (report) =>
        report.status === 'open' && (
          <Stack direction="row" gap={vars.spacing[2]}>
            <Button size="sm" disabled={action.pending} onClick={() => close(list, report, 'resolved')}>
              {t.resolve}
            </Button>
            <Button size="sm" variant="muted" disabled={action.pending} onClick={() => close(list, report, 'dismissed')}>
              {t.dismiss}
            </Button>
          </Stack>
        ),
    },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.description}</Text>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {action.error && (
        <Notice tone="danger" onDismiss={action.clearError}>
          {action.error}
        </Notice>
      )}
      <AsyncContent state={reports} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
        {(list) => {
          const visible = list.filter((report) => status === allStatuses || report.status === status);
          return (
            <Stack>
              <FilterBar>
                <SelectField
                  label={t.statusLabel}
                  options={[
                    { value: allStatuses, label: t.allStatuses },
                    ...reportStatuses.map((value) => ({ value, label: t.statuses[value] })),
                  ]}
                  value={status}
                  onChange={(value) => setStatus(isOneOf(reportStatuses, value) ? value : allStatuses)}
                />
              </FilterBar>
              {visible.length > 0 ? (
                <DataTable label={t.tableLabel} columns={columns(list)} rows={visible} getRowKey={(report) => report.id} />
              ) : (
                <EmptyState
                  title={t.noneTitle}
                  message={t.noneMessage}
                  action={<Button onClick={() => setStatus(allStatuses)}>{t.showAll}</Button>}
                />
              )}
            </Stack>
          );
        }}
      </AsyncContent>
    </Stack>
  );
};
