import { useState, type FormEvent } from 'react';
import { decidePayout } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Payout, PayoutDecision } from '@/features/admin/types';
import { isBlank } from '@/features/admin/utils';
import { Button, DetailList, Modal, Text, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, formatPrice } from '@/shared/utils';

// Rejecting or marking as failed needs a note, because the creator is told why.
const needsNote: Record<PayoutDecision, boolean> = { approved: false, rejected: true, paid: false, failed: true };

interface PayoutDecisionModalProps {
  payout: Payout;
  decision: PayoutDecision;
  onClose: () => void;
  onDone: (payout: Payout) => void;
}

export const PayoutDecisionModal = ({ payout, decision, onClose, onDone }: PayoutDecisionModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.payouts;
  const labels = t.decisions[decision];
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const noteMissing = needsNote[decision] && isBlank(note);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (noteMissing) return;
    const result = await run(() => decidePayout(currentAdmin.id, payout.id, decision, note));
    if (result.ok) onDone(result.data);
  };

  return (
    <Modal
      open
      title={labels.title}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" variant={needsNote[decision] ? 'danger' : 'primary'} disabled={pending}>
            {labels.confirm}
          </Button>
        </>
      }
    >
      <DetailList
        rows={[
          { label: text.admin.columns.creator, value: <Text as="span" autoDirection>{payout.creator.name}</Text> },
          { label: text.admin.columns.amount, value: formatPrice(payout.amount, locale) },
          {
            label: text.admin.columns.method,
            value: (
              <>
                {text.admin.methods[payout.method]} <bdi>{payout.account}</bdi>
              </>
            ),
          },
          { label: text.admin.columns.requested, value: formatDate(payout.requestedAt, locale) },
        ]}
      />
      <Text color={vars.colors.textMuted}>{labels.message}</Text>
      {error && <Notice tone="danger">{error}</Notice>}
      <TextField rows={4}
        label={t.noteLabel}
        hint={needsNote[decision] ? t.noteRequiredHint : text.admin.common.optional}
        value={note}
        onChange={setNote}
        error={submitted && noteMissing ? t.noteRequired : undefined}
        required={needsNote[decision]}
      />
    </Modal>
  );
};
