import { useState } from 'react';
import { fetchInvoices } from '@/features/admin/api';
import { Badge, DataTable, Notice, PageHeader, RequirePermission, Stack, type DataTableColumn } from '@/features/admin/components';
import { invoiceStatusTone } from '@/features/admin/constants';
import type { Invoice } from '@/features/admin/types';
import { fillText, formatMoney, isolate } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';
import { IssueInvoiceModal } from './IssueInvoiceModal';

const Invoices = () => {
  const { text, locale } = useLocale();
  const invoices = useAsync(fetchInvoices, []);
  const [issuing, setIssuing] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; message: string } | null>(null);
  const t = text.admin.invoices;
  const current = invoices.status === 'success' ? invoices.data : [];

  const columns: DataTableColumn<Invoice>[] = [
    {
      key: 'number',
      header: text.admin.columns.number,
      render: (row) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">
            <bdi>{row.number}</bdi>
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {t.kinds[row.kind]}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'customer',
      header: text.admin.columns.customer,
      render: (row) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            {row.customerName}
          </Text>
          {row.taxId && (
            <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
              {fillText(t.taxIdLine, { taxId: isolate(row.taxId) })}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      key: 'amount',
      header: text.admin.columns.amount,
      render: (row) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">{formatMoney(row.amount + row.vat, locale)}</Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {fillText(t.vatLine, { vat: formatMoney(row.vat, locale) })}
          </Text>
        </Stack>
      ),
    },
    { key: 'issued', header: text.admin.columns.issued, render: (row) => formatDate(row.issuedAt, locale) },
    {
      key: 'status',
      header: text.admin.columns.status,
      render: (row) => (
        <Stack gap={vars.spacing[1]} align="start">
          <Badge tone={invoiceStatusTone[row.status]}>{t.statuses[row.status]}</Badge>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {row.etaUuid ? (
              fillText(t.uuidLine, { uuid: isolate(row.etaUuid) })
            ) : (
              row.rejectReason && t.rejectReasons[row.rejectReason]
            )}
          </Text>
        </Stack>
      ),
    },
  ];

  const issueButton = <Button onClick={() => setIssuing(true)}>{t.issue}</Button>;

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.title} description={t.description} actions={current.length > 0 && issueButton} />
      <Notice tone="info">{t.demoNote}</Notice>
      {notice && (
        <Notice tone={notice.tone} onDismiss={() => setNotice(null)}>
          {notice.message}
        </Notice>
      )}
      <AsyncContent
        state={invoices}
        empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} action={issueButton} />}
      >
        {(list) => <DataTable label={t.title} columns={columns} rows={list} getRowKey={(row) => row.id} />}
      </AsyncContent>
      {issuing && (
        <IssueInvoiceModal
          onClose={() => setIssuing(false)}
          onIssued={(invoice) => {
            invoices.update([invoice, ...current]);
            setIssuing(false);
            const accepted = invoice.status === 'accepted';
            setNotice({
              tone: accepted ? 'success' : 'danger',
              message: fillText(accepted ? t.accepted : t.rejected, { number: isolate(invoice.number) }),
            });
          }}
        />
      )}
    </Stack>
  );
};

export const InvoicesPage = () => (
  <RequirePermission permission="issueInvoices">
    <Invoices />
  </RequirePermission>
);
