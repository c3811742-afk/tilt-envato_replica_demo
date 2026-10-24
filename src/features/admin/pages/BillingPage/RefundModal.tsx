import { useState, type FormEvent } from 'react';
import { refundTransaction } from '@/features/admin/api';
import { Modal, Notice, SelectField, TextField } from '@/features/admin/components';
import { refundReasons } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { RefundReason, Transaction } from '@/features/admin/types';
import { fillText, formatMoney, hasErrors, isOneOf, isValidAmount, isolate, refundable, toNumber } from '@/features/admin/utils';
import { Button, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

interface RefundModalProps {
  transaction: Transaction;
  onClose: () => void;
  onRefunded: (transaction: Transaction, amount: number) => void;
}

// A full refund is filled in; lower the amount for a partial one. Demo: no money moves.
export const RefundModal = ({ transaction, onClose, onRefunded }: RefundModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.billing.refund;
  const available = refundable(transaction);
  const [amount, setAmount] = useState(String(available));
  const [reason, setReason] = useState<RefundReason | ''>('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    amount:
      isValidAmount(amount) && (toNumber(amount) ?? 0) <= available
        ? undefined
        : fillText(t.amountInvalid, { max: formatMoney(available, locale) }),
    reason: reason ? undefined : text.admin.live.reasonRequired,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors) || !reason) return;
    const value = toNumber(amount) ?? 0;
    const result = await run(() => refundTransaction(currentAdmin.id, transaction.id, { amount: value, reason, note }));
    if (result.ok) onRefunded(result.data, value);
  };

  return (
    <Modal
      open
      title={t.title}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" variant="danger" disabled={pending}>
            {t.confirm}
          </Button>
        </>
      }
    >
      <Text>
        {fillText(t.summary, {
          name: isolate(transaction.customer.name),
          amount: formatMoney(transaction.amount, locale),
          method: text.admin.methods[transaction.method],
        })}
      </Text>
      <Text color={vars.colors.textMuted}>{t.message}</Text>
      {error && <Notice tone="danger">{error}</Notice>}
      <TextField
        type="number"
        label={t.amountLabel}
        hint={fillText(t.amountHint, { max: formatMoney(available, locale) })}
        value={amount}
        onChange={setAmount}
        error={submitted ? errors.amount : undefined}
        min="0"
        required
      />
      <SelectField
        label={text.admin.live.reasonLabel}
        placeholder={text.admin.live.reasonPlaceholder}
        options={refundReasons.map((value) => ({ value, label: text.admin.refundReasons[value] }))}
        value={reason}
        onChange={(value) => isOneOf(refundReasons, value) && setReason(value)}
        error={submitted ? errors.reason : undefined}
        required
      />
      <TextField
        multiline
        label={t.noteLabel}
        hint={text.admin.common.optional}
        value={note}
        onChange={setNote}
        autoDirection
      />
    </Modal>
  );
};
