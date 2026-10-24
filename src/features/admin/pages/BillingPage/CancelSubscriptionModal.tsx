import { useState, type FormEvent } from 'react';
import { cancelSubscription } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import { cancelReasons } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { CancelReason, CancelTiming, Subscription } from '@/features/admin/types';
import { fillText, isOneOf, isolate } from '@/features/admin/utils';
import { Button, Modal, Select, Text, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';

const timings: readonly CancelTiming[] = ['periodEnd', 'now'];

interface CancelSubscriptionModalProps {
  subscription: Subscription;
  onClose: () => void;
  onCanceled: (subscription: Subscription) => void;
}

// At the end of the period by default, so the customer keeps what they paid for. "Now" is for fraud and similar cases.
export const CancelSubscriptionModal = ({ subscription, onClose, onCanceled }: CancelSubscriptionModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.billing.cancel;
  // A subscription already ending at period end can only be ended now.
  const options = subscription.status === 'canceling' ? timings.filter((option) => option === 'now') : timings;
  const [timing, setTiming] = useState<CancelTiming>(options[0]);
  const [reason, setReason] = useState<CancelReason | ''>('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const renewal = formatDate(subscription.renewsAt, locale);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!reason) return;
    const result = await run(() => cancelSubscription(currentAdmin.id, subscription.id, { timing, reason, note }));
    if (result.ok) onCanceled(result.data);
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
        {fillText(t.summary, { name: isolate(subscription.customer.name), plan: isolate(subscription.planName) })}
      </Text>
      {error && <Notice tone="danger">{error}</Notice>}
      <Select
        label={t.timingLabel}
        options={options.map((value) => ({ value, label: fillText(t.timings[value], { date: renewal }) }))}
        value={timing}
        onChange={(value) => isOneOf(timings, value) && setTiming(value)}
      />
      <Select
        label={text.admin.live.reasonLabel}
        placeholder={text.admin.live.reasonPlaceholder}
        options={cancelReasons.map((value) => ({ value, label: text.admin.cancelReasons[value] }))}
        value={reason}
        onChange={(value) => isOneOf(cancelReasons, value) && setReason(value)}
        error={submitted && !reason ? text.admin.live.reasonRequired : undefined}
        required
      />
      <TextField rows={4}
        label={t.noteLabel}
        hint={text.admin.common.optional}
        value={note}
        onChange={setNote}
      />
    </Modal>
  );
};
