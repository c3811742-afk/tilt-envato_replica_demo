import { useState, type FormEvent } from 'react';
import { fetchUninvoicedTransactions, issueInvoice } from '@/features/admin/api';
import { DetailList, Modal, Notice, SelectField, TextField } from '@/features/admin/components';
import { invoiceKinds, vatRate } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Invoice, InvoiceKind } from '@/features/admin/types';
import { fillText, formatMoney, isOneOf, isValidTaxId, refundable } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';

interface IssueInvoiceModalProps {
  onClose: () => void;
  onIssued: (invoice: Invoice) => void;
}

// Pick a payment, then send an e-receipt (to a person) or an e-invoice (to a company, with its tax ID).
export const IssueInvoiceModal = ({ onClose, onIssued }: IssueInvoiceModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const transactions = useAsync(fetchUninvoicedTransactions, []);
  const t = text.admin.invoices;
  const [transactionId, setTransactionId] = useState('');
  const [kind, setKind] = useState<InvoiceKind>('receipt');
  const [taxId, setTaxId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const list = transactions.status === 'success' ? transactions.data : [];
  const selected = list.find((transaction) => transaction.id === transactionId);

  const errors = {
    transaction: selected ? undefined : t.transactionRequired,
    taxId: kind === 'receipt' || isValidTaxId(taxId) ? undefined : t.taxIdInvalid,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (errors.transaction || errors.taxId) return;
    const result = await run(() => issueInvoice(currentAdmin.id, { transactionId, kind, taxId }));
    if (result.ok) onIssued(result.data);
  };

  const amount = selected ? refundable(selected) : 0;

  return (
    <Modal
      open
      title={t.issue}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending || list.length === 0}>
            {t.send}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <AsyncContent state={transactions} empty={<EmptyState title={t.nothingTitle} message={t.nothingMessage} />}>
        {(rows) => (
          <>
            <SelectField
              label={t.transactionLabel}
              placeholder={t.transactionPlaceholder}
              options={rows.map((row) => ({
                value: row.id,
                label: fillText(t.transactionOption, {
                  name: row.customer.name,
                  amount: formatMoney(refundable(row), locale),
                  date: formatDate(row.at, locale),
                }),
              }))}
              value={transactionId}
              onChange={setTransactionId}
              error={submitted ? errors.transaction : undefined}
              required
            />
            <SelectField
              label={t.kindLabel}
              options={invoiceKinds.map((value) => ({ value, label: t.kinds[value] }))}
              value={kind}
              onChange={(value) => isOneOf(invoiceKinds, value) && setKind(value)}
            />
            {kind === 'invoice' && (
              <TextField
                label={t.taxIdLabel}
                hint={t.taxIdHint}
                value={taxId}
                onChange={setTaxId}
                error={submitted ? errors.taxId : undefined}
                direction="ltr"
                required
              />
            )}
            {selected && (
              <DetailList
                items={[
                  { label: t.subtotal, value: formatMoney(amount, locale) },
                  { label: t.vat, value: formatMoney(amount * vatRate, locale) },
                  { label: t.total, value: formatMoney(amount * (1 + vatRate), locale) },
                ]}
              />
            )}
          </>
        )}
      </AsyncContent>
    </Modal>
  );
};
