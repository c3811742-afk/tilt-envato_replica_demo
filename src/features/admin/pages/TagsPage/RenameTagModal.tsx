import { useState, type FormEvent } from 'react';
import { adminErrorCode, renameTag } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Tag } from '@/features/admin/types';
import { isBlank } from '@/features/admin/utils';
import { Button, Modal, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

interface RenameTagModalProps {
  tag: Tag;
  onClose: () => void;
  onSaved: (tags: Tag[], name: string) => void;
}

// Fixes a tag's spelling on every element that uses it. A name that's already taken points to "Merge" instead.
export const RenameTagModal = ({ tag, onClose, onSaved }: RenameTagModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error, clearError } = useAdminAction();
  const t = text.admin.tags;
  const [name, setName] = useState(tag.name);
  const [fieldError, setFieldError] = useState<string>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBlank(name)) {
      setFieldError(t.nameRequired);
      return;
    }
    setFieldError(undefined);
    if (name.trim() === tag.name) {
      onClose(); // nothing changed
      return;
    }
    const result = await run(() => renameTag(currentAdmin.id, tag.id, name));
    if (result.ok) {
      onSaved(result.data, name.trim());
      return;
    }
    // A taken name belongs to the field; anything else is shown above the form.
    if (adminErrorCode(result.error) === 'tagExists') {
      clearError();
      setFieldError(text.admin.errors.tagExists);
    }
  };

  return (
    <Modal
      open
      title={t.renameTitle}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {t.rename}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <TextField label={t.nameLabel} value={name} onChange={setName} error={fieldError} required />
    </Modal>
  );
};
