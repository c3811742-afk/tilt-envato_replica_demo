import { useState, type FormEvent } from 'react';
import { Modal, Notice, SelectField, TextField } from '@/features/admin/components';
import { flagKinds } from '@/features/admin/constants';
import type { FlagInput, FlagKind } from '@/features/admin/types';
import { isOneOf, isValidLink } from '@/features/admin/utils';
import { Button, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

interface FlagModalProps {
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: FlagInput) => void;
}

// Flags an element as a duplicate or plagiarised, with an optional link to the original.
export const FlagModal = ({ pending, error, onClose, onSubmit }: FlagModalProps) => {
  const { text } = useLocale();
  const t = text.admin.review;
  const [kind, setKind] = useState<FlagKind>('duplicate');
  const [originalLink, setOriginalLink] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const link = originalLink.trim();
  const linkError = submitted && link !== '' && !isValidLink(link) ? t.originalLinkInvalid : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (link !== '' && !isValidLink(link)) return;
    onSubmit({ kind, originalLink: link, note: note.trim() });
  };

  return (
    <Modal
      open
      title={t.flagTitle}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" variant="danger" disabled={pending}>
            {t.flag}
          </Button>
        </>
      }
    >
      <Text color={vars.colors.textMuted}>{t.flagMessage}</Text>
      {error && <Notice tone="danger">{error}</Notice>}
      <SelectField
        label={t.flagKindLabel}
        options={flagKinds.map((value) => ({ value, label: text.admin.flagKinds[value] }))}
        value={kind}
        onChange={(value) => isOneOf(flagKinds, value) && setKind(value)}
      />
      <TextField
        type="url"
        label={t.originalLinkLabel}
        hint={text.admin.common.optional}
        placeholder={t.originalLinkPlaceholder}
        value={originalLink}
        onChange={setOriginalLink}
        error={linkError}
      />
      <TextField multiline label={t.noteLabel} hint={t.noteHint} value={note} onChange={setNote} autoDirection />
    </Modal>
  );
};
