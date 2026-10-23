import { useState } from 'react';
import { Badge, Button, DetailList, Divider, Icon, Modal, Section, Stack, Table, Text } from '@/shared/components';
import { seller, vatRate } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Invoice } from '@/shared/types';
import { buildInvoiceText, downloadTextFile, fillText, formatDate, formatPercent, invoiceAddress, invoiceBuyer, invoiceLineLabel } from '@/shared/utils';

// Every payment's e-invoice: view it, or download it.
export const Invoices = ({ invoices }: { invoices: Invoice[] }) => {
  const { text, locale, price } = useLocale();
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const download = (invoice: Invoice) => downloadTextFile(`${invoice.number}.txt`, buildInvoiceText(invoice, text, locale));

  return (
    <Section title={text.billingPage.invoicesTitle} variant="h3" gap={vars.spacing[3]}>
      <Table
        label={text.billingPage.invoicesTitle}
        columns={[
          { key: 'number', label: text.invoice.number },
          { key: 'date', label: text.invoice.date },
          { key: 'status', label: text.invoice.status },
          { key: 'total', label: text.invoice.total, align: 'end' },
          { key: 'actions', label: '', align: 'end' },
        ]}
        rows={invoices.map((invoice) => ({
          key: invoice.id,
          cells: {
            number: <bdi>{invoice.number}</bdi>,
            date: formatDate(invoice.issuedAt, locale),
            status: <Badge variant={invoice.status === 'paid' ? 'free' : 'neutral'}>{text.billingPage.invoiceStatuses[invoice.status]}</Badge>,
            total: price(invoice.total),
            actions: (
              <Stack direction="row" justify="flex-end" gap={vars.spacing[2]}>
                <Button variant="outline" size="sm" onClick={() => setViewing(invoice)}>
                  {text.billingPage.view}
                </Button>
                <Button variant="outline" size="sm" onClick={() => download(invoice)} ariaLabel={`${text.billingPage.download} ${invoice.number}`}>
                  <Icon name="download" size={vars.sizes.icon.sm} />
                </Button>
              </Stack>
            ),
          },
        }))}
        emptyText={text.billingPage.invoicesEmpty}
      />

      {viewing && (
        <Modal
          open
          onClose={() => setViewing(null)}
          title={`${text.invoice.heading} (${text.invoice.eInvoice})`}
          width={vars.sizes.modal.wideWidth}
          actions={
            <Button onClick={() => download(viewing)}>
              <Icon name="download" size={vars.sizes.icon.sm} />
              {text.billingPage.download}
            </Button>
          }
        >
          <DetailList
            rows={[
              { label: text.invoice.number, value: viewing.number },
              { label: text.invoice.date, value: formatDate(viewing.issuedAt, locale) },
              { label: text.invoice.taxUuid, value: viewing.taxUuid },
              { label: text.invoice.seller, value: `${text.brand.name}, ${text.invoice.sellerTaxId} ${seller.taxRegistrationNumber}` },
              { label: text.invoice.buyer, value: invoiceBuyer(viewing), autoDirection: true },
              ...(viewing.billingAddress ? [{ label: text.invoice.address, value: invoiceAddress(viewing, text), autoDirection: true }] : []),
              { label: text.invoice.paidWith, value: text.pricing.paymentMethods[viewing.paymentMethod] },
              { label: text.invoice.status, value: text.billingPage.invoiceStatuses[viewing.status] },
            ]}
          />
          <Table
            label={text.invoice.description}
            columns={[
              { key: 'description', label: text.invoice.description },
              { key: 'amount', label: text.invoice.amount, align: 'end' },
            ]}
            rows={viewing.lines.map((line, index) => ({
              key: String(index),
              cells: { description: invoiceLineLabel(line, text, locale), amount: price(line.amount) },
            }))}
          />
          <Divider />
          <DetailList
            rows={[
              { label: text.invoice.beforeVat, value: price(viewing.total - viewing.vat) },
              { label: fillText(text.invoice.vat, { rate: formatPercent(vatRate, locale) }), value: price(viewing.vat) },
              { label: text.invoice.total, value: price(viewing.total) },
            ]}
          />
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {text.invoice.note}
          </Text>
        </Modal>
      )}
    </Section>
  );
};
