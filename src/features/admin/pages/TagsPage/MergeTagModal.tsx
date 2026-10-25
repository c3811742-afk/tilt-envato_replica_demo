import { useState, type FormEvent } from 'react';
import { mergeTags } from '@/features/admin/api';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Tag } from '@/features/admin/types';
import { Modal, ModalActions, Notice, Select, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatNumber, isolate } from '@/shared/utils';

interface MergeTagModalProps {
  tag: Tag;
  tags: Tag[];
  onClose: () => void;
  onMerged: (tags: Tag[], target: Tag) => void;
}

// Moves every element from this tag to another one (e.g. "Ramadhan" into "ramadan"), then deletes this tag.
export const MergeTagModal = ({ tag, tags, onClose, onMerged }: MergeTagModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
  const t = text.admin.tags;
  const [targetId, setTargetId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const targets = tags.filter((other) => other.id !== tag.id && !other.banned);
  const target = targets.find((other) => other.id === targetId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!target) return;
    const result = await run(() => mergeTags(currentAdmin.id, tag.id, target.id));
    if (result.ok) onMerged(result.data, target);
  };

  return (
    <Modal
      open
      title={t.mergeTitle}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <ModalActions confirmLabel={t.merge} onCancel={onClose} submit busy={pending} />
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <Text color={vars.colors.textMuted}>
        {fillText(t.mergeMessage, { source: isolate(tag.name), count: formatNumber(tag.usage, locale) })}
      </Text>
      <Select
        label={t.mergeIntoLabel}
        placeholder={t.mergeIntoPlaceholder}
        options={targets.map((other) => ({
          value: other.id,
          label: fillText(t.tagWithUsage, { name: isolate(other.name), count: formatNumber(other.usage, locale) }),
        }))}
        value={targetId}
        onChange={setTargetId}
        error={submitted && !target ? t.mergeIntoRequired : undefined}
        required
      />
    </Modal>
  );
};
