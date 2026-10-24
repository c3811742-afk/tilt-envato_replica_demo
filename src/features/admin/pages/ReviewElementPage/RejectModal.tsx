import { useState, type FormEvent } from 'react';
import { hardRejectReasons, softRejectReasons } from '@/features/admin/constants';
import type { RejectDecision, RejectReason } from '@/features/admin/types';
import { toggleItem } from '@/features/admin/utils';
import { Checkbox, FieldGroup, Modal, ModalActions, Notice, Text, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

interface RejectModalProps {
  decision: RejectDecision;
  pending: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (reasons: RejectReason[], comment: string) => void;
}

// Soft or hard reject: at least one preset reason, plus an optional comment for the creator.
export const RejectModal = ({ decision, pending, error, onClose, onSubmit }: RejectModalProps) => {
  const { text } = useLocale();
  const t = text.admin.review;
  const [reasons, setReasons] = useState<RejectReason[]>([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isSoft = decision === 'softRejected';
  const presetReasons: readonly RejectReason[] = isSoft ? softRejectReasons : hardRejectReasons;
  const title = isSoft ? t.softReject : t.hardReject;
  const reasonsError = submitted && reasons.length === 0 ? t.reasonsRequired : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (reasons.length === 0) return;
    onSubmit(reasons, comment.trim());
  };

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <ModalActions confirmLabel={title} onCancel={onClose} submit tone={isSoft ? 'highlight' : 'danger'} busy={pending} />
      }
    >
      <Text color={vars.colors.textMuted}>{isSoft ? t.softRejectMessage : t.hardRejectMessage}</Text>
      {error && <Notice tone="danger">{error}</Notice>}
      <FieldGroup label={t.reasonsLabel} error={reasonsError}>
        {presetReasons.map((reason) => (
          <Checkbox
            key={reason}
            label={text.admin.reasons[reason]}
            checked={reasons.includes(reason)}
            onChange={() => setReasons(toggleItem(reasons, reason))}
          />
        ))}
      </FieldGroup>
      <TextField rows={4}
        label={t.commentLabel}
        hint={t.commentHint}
        value={comment}
        onChange={setComment}
      />
    </Modal>
  );
};
