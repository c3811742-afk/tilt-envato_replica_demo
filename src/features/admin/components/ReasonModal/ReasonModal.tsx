import { useState, type FormEvent } from 'react';
import { Button, Modal, Select, Text, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { isOneOf } from '@/features/admin/utils/lists';

import { Notice } from '../Notice';

import { reasonModalDefaults } from './ReasonModal.defaults';
import type { ReasonModalProps } from './ReasonModal.types';

// Asks for a reason (required) and an optional note before an action like unpublishing or deprecating.
// The labels default to the unpublish wording; pass your own for other actions.
export const ReasonModal = <R extends string>(props: ReasonModalProps<R>) => {
  const { text } = useLocale();
  const t = text.admin.live;
  const {
    title,
    confirmLabel,
    reasons,
    reasonLabels,
    onSubmit,
    onClose,
    children,
    message,
    reasonLabel = t.reasonLabel,
    reasonPlaceholder = t.reasonPlaceholder,
    reasonRequired = t.reasonRequired,
    noteLabel = t.noteLabel,
    noteHint = text.admin.common.optional,
    tone,
    pending,
    error,
  } = withDefaults(reasonModalDefaults, props);
  const [reason, setReason] = useState<R | ''>('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!reason) return;
    onSubmit({ reason, note: note.trim() });
  };

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" variant={tone} disabled={pending}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
      {message && <Text color={vars.colors.textMuted}>{message}</Text>}
      {error && <Notice tone="danger">{error}</Notice>}
      <Select
        label={reasonLabel}
        placeholder={reasonPlaceholder}
        options={reasons.map((value) => ({ value, label: reasonLabels[value] }))}
        value={reason}
        onChange={(value) => isOneOf(reasons, value) && setReason(value)}
        error={submitted && !reason ? reasonRequired : undefined}
        required
      />
      <TextField rows={4} label={noteLabel} hint={noteHint} value={note} onChange={setNote} />
    </Modal>
  );
};
