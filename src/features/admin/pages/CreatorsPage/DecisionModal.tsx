import { useState, type ReactNode } from 'react';
import type { DecisionInput } from '@/features/admin/types';
import { Button, DetailList, Modal, Notice, Select, Text, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { isOneOf } from '@/shared/utils';

interface DecisionModalProps<R extends string> {
  title: string;
  details: { label: string; value: ReactNode }[];
  open: boolean; // still waiting for a decision; decided ones only show the details
  reasons: readonly R[];
  reasonLabels: Record<R, string>;
  pending: boolean;
  error?: string;
  onDecide: (input: DecisionInput<R>) => void;
  onClose: () => void;
}

// Approve, or reject with a reason (the person is told which). Used for creator applications and identity checks.
export const DecisionModal = <R extends string>({
  title,
  details,
  open,
  reasons,
  reasonLabels,
  pending,
  error,
  onDecide,
  onClose,
}: DecisionModalProps<R>) => {
  const { text } = useLocale();
  const t = text.admin.creators;
  const [reason, setReason] = useState<R | ''>('');
  const [note, setNote] = useState('');
  const [reasonError, setReasonError] = useState<string>();

  const reject = () => {
    if (!reason) {
      setReasonError(t.reasonRequired);
      return;
    }
    onDecide({ approve: false, reason, note: note.trim() });
  };

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      actions={
        open && (
          <>
            <Button variant="muted" disabled={pending} onClick={reject}>
              {t.reject}
            </Button>
            <Button disabled={pending} onClick={() => onDecide({ approve: true, note: note.trim() })}>
              {t.approve}
            </Button>
          </>
        )
      }
    >
      <DetailList rows={details} />
      {open && <Text>{t.decideMessage}</Text>}
      {error && <Notice tone="danger">{error}</Notice>}
      {open && (
        <>
          <Select
            label={t.rejectReason}
            hint={t.rejectReasonHint}
            placeholder={t.reasonPlaceholder}
            options={reasons.map((value) => ({ value, label: reasonLabels[value] }))}
            value={reason}
            onChange={(value) => {
              if (isOneOf(value, reasons)) setReason(value);
              setReasonError(undefined);
            }}
            error={reasonError}
          />
          <TextField rows={4} label={t.noteLabel} hint={text.admin.common.optional} value={note} onChange={setNote} />
        </>
      )}
    </Modal>
  );
};
