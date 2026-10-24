import { useState } from 'react';
import { fetchItemReports, resolveItemReport } from '@/features/admin/api';
import { ConfirmModal, Notice } from '@/features/admin/components';
import { itemReportKindTone, itemReportStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { ItemReport, ItemReportResolution } from '@/features/admin/types';
import { fillText, isolate, replaceById } from '@/features/admin/utils';
import {
  AsyncContent,
  Badge,
  Button,
  EmptyState,
  type RecordColumn,
  recordRows,
  Stack,
  Table,
  Text,
} from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';

// Customer reports about live elements: broken files, infringement, wrong category, offensive content.
export const ItemReportsTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const reports = useAsync(fetchItemReports, []);
  const action = useAdminAction();
  const [removing, setRemoving] = useState<ItemReport | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.itemReports;
  const current = reports.status === 'success' ? reports.data : [];

  const resolve = async (report: ItemReport, resolution: ItemReportResolution) => {
    setNotice(null);
    const result = await action.run(() => resolveItemReport(currentAdmin.id, report.id, resolution));
    if (!result.ok) return;
    reports.update(replaceById(current, result.data));
    setRemoving(null);
    setNotice(fillText(t.done[resolution], { title: isolate(report.element.title) }));
  };

  const columns: RecordColumn<ItemReport>[] = [
    {
      key: 'element',
      label: text.admin.columns.element,
      render: (report) => (
        <Stack gap={vars.spacing[1]} align="flex-start">
          <Text as="span" autoDirection>
            {report.element.title}
          </Text>
          <Badge variant={itemReportKindTone[report.kind]}>{t.kinds[report.kind]}</Badge>
        </Stack>
      ),
    },
    {
      key: 'report',
      label: text.admin.columns.report,
      render: (report) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            {report.note}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {fillText(text.admin.search.reports.reportedBy, {
              name: isolate(report.reporter),
              date: formatDate(report.reportedAt, locale),
            })}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (report) => <Badge variant={itemReportStatusTone[report.status]}>{t.statuses[report.status]}</Badge>,
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      render: (report) =>
        report.status === 'open' && (
          <Stack direction="row" wrap gap={vars.spacing[2]}>
            <Button size="sm" disabled={action.pending} onClick={() => resolve(report, 'fixed')}>
              {t.markFixed}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                action.clearError();
                setRemoving(report);
              }}
            >
              {t.remove}
            </Button>
            <Button size="sm" variant="muted" disabled={action.pending} onClick={() => resolve(report, 'dismissed')}>
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
      {action.error && !removing && (
        <Notice tone="danger" onDismiss={action.clearError}>
          {action.error}
        </Notice>
      )}
      <AsyncContent state={reports} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
        {(list) => <Table label={t.tableLabel} columns={columns} rows={recordRows(list, (report) => report.id, columns)} stackOnMobile />}
      </AsyncContent>
      {removing && (
        <ConfirmModal
          title={t.removeTitle}
          confirmLabel={t.remove}
          tone="danger"
          message={t.removeMessage}
          pending={action.pending}
          error={action.error}
          onConfirm={() => resolve(removing, 'removed')}
          onClose={() => setRemoving(null)}
        >
          <Text autoDirection>
            <strong>{removing.element.title}</strong>
          </Text>
        </ConfirmModal>
      )}
    </Stack>
  );
};
