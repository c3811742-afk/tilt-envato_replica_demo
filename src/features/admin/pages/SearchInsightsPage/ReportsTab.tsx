import { useState } from 'react';
import { closeSearchReport, fetchSearchReports } from '@/features/admin/api';
import { reportStatuses, reportStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { ReportResolution, ReportStatus, SearchReport } from '@/features/admin/types';
import { replaceById } from '@/features/admin/utils';
import { AsyncContent, Badge, Button, EmptyState, FilterBar, Notice, type RecordColumn, recordRows, Select, Stack, Table, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, isolate, isOneOf } from '@/shared/utils';

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
    const values = { title: isolate(report.element?.title ?? report.term), term: isolate(report.term) };
    setNotice(fillText(resolution === 'resolved' ? t.resolvedNotice : t.dismissedNotice, values));
  };

  const columns = (list: SearchReport[]): RecordColumn<SearchReport>[] => [
    {
      key: 'term',
      label: text.admin.columns.term,
      render: (report) => (
        <Text as="span" autoDirection>
          {report.term}
        </Text>
      ),
    },
    {
      key: 'element',
      label: text.admin.columns.element,
      render: (report) => (
        <Text as="span" autoDirection>
          {report.element?.title ?? t.allResults}
        </Text>
      ),
    },
    {
      key: 'report',
      label: text.admin.columns.report,
      render: (report) => (
        <Stack gap={vars.spacing[1]}>
          {report.reason && <Text as="span">{text.searchReport.reasons[report.reason]}</Text>}
          {report.note && (
            <Text as="span" autoDirection>
              {report.note}
            </Text>
          )}
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {fillText(t.reportedBy, { name: isolate(report.reportedBy), date: formatDate(report.reportedAt, locale) })}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (report) => <Badge variant={reportStatusTone[report.status]}>{t.statuses[report.status]}</Badge>,
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (report) =>
        report.status === 'open' && (
          <Stack direction="row" justify="flex-end" wrap gap={vars.spacing[2]}>
            <Button size="sm" disabled={action.busy} onClick={() => close(list, report, 'resolved')}>
              {t.resolve}
            </Button>
            <Button size="sm" variant="muted" disabled={action.busy} onClick={() => close(list, report, 'dismissed')}>
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
                <Select
                  label={t.statusLabel}
                  options={[
                    { value: allStatuses, label: t.allStatuses },
                    ...reportStatuses.map((value) => ({ value, label: t.statuses[value] })),
                  ]}
                  value={status}
                  onChange={(value) => setStatus(isOneOf(value, reportStatuses) ? value : allStatuses)}
                />
              </FilterBar>
              {visible.length > 0 ? (
                <Table label={t.tableLabel} columns={columns(list)} rows={recordRows(visible, (report) => report.id, columns(list))} stackOnMobile />
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
