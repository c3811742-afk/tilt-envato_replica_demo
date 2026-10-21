import { useState, type FormEvent } from 'react';
import { Modal, Notice, SelectField, TextField } from '@/features/admin/components';
import { unpublishReasons } from '@/features/admin/constants';
import type { CatalogElement, UnpublishInput, UnpublishReason } from '@/features/admin/types';
import { isOneOf } from '@/features/admin/utils';
import { Button, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

interface UnpublishModalProps {
  element: CatalogElement;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: UnpublishInput) => void;
}

// Asks for a reason (required) and an optional note before taking an element off the site.
export const UnpublishModal = ({ element, pending, error, onClose, onSubmit }: UnpublishModalProps) => {
  const { text } = useLocale();
  const t = text.admin.live;
  const [reason, setReason] = useState<UnpublishReason | ''>('');
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
      title={t.unpublishTitle}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" variant="danger" disabled={pending}>
            {t.unpublish}
          </Button>
        </>
      }
    >
      <Text autoDirection>
        <strong>{element.title}</strong>
      </Text>
      <Text color={vars.colors.textMuted}>{t.unpublishMessage}</Text>
      {error && <Notice tone="danger">{error}</Notice>}
      <SelectField
        label={t.reasonLabel}
        placeholder={t.reasonPlaceholder}
        options={unpublishReasons.map((value) => ({ value, label: text.admin.unpublishReasons[value] }))}
        value={reason}
        onChange={(value) => isOneOf(unpublishReasons, value) && setReason(value)}
        error={submitted && !reason ? t.reasonRequired : undefined}
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
