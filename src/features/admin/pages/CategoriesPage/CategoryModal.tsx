import { useState, type FormEvent } from 'react';
import { createCategory, renameCategory } from '@/features/admin/api';
import { LocalizedField, Notice } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Category } from '@/features/admin/types';
import { emptyLocalized, fillText, hasErrors, isolate, localized, localizedErrors } from '@/features/admin/utils';
import { Button, Modal, Select, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

// Adding: a subcategory of one of the site's categories (chosen here, or already chosen).
// Editing: only the names; the parent can't change, so subcategories never end up three levels deep.
export type CategoryModalMode = { kind: 'new'; parentId: string | null } | { kind: 'edit'; category: Category };

interface CategoryModalProps {
  mode: CategoryModalMode;
  categories: Category[];
  onClose: () => void;
  onSaved: (category: Category) => void;
}

export const CategoryModal = ({ mode, categories, onClose, onSaved }: CategoryModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.categoryList;
  const editing = mode.kind === 'edit' ? mode.category : null;
  const [name, setName] = useState(editing?.name ?? emptyLocalized());
  const topLevel = categories.filter((category) => !category.parentId);
  const [parentId, setParentId] = useState(mode.kind === 'new' ? (mode.parentId ?? topLevel[0]?.id ?? '') : '');
  const [submitted, setSubmitted] = useState(false);

  const nameErrors = localizedErrors(name, text);
  const fixedParentId = editing ? editing.parentId : mode.kind === 'new' ? mode.parentId : null;
  const fixedParent = categories.find((category) => category.id === fixedParentId);
  const title = editing ? t.editTitle : t.newSubTitle;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(nameErrors)) return;
    const result = await run(() =>
      editing
        ? renameCategory(currentAdmin.id, editing.id, name)
        : createCategory(currentAdmin.id, { name, parentId: fixedParent?.id ?? parentId }),
    );
    if (result.ok) onSaved(result.data);
  };

  const parentOptions = topLevel.map((category) => ({ value: category.id, label: localized(category.name, locale) }));

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
          <Button type="submit" disabled={pending}>
            {editing ? text.common.saveChanges : t.addSub}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <LocalizedField
        label={t.nameLabel}
        value={name}
        onChange={setName}
        required
        errors={submitted ? nameErrors : {}}
      />
      {fixedParent ? (
        <Text color={vars.colors.textMuted}>
          {fillText(t.inParent, { name: isolate(localized(fixedParent.name, locale)) })}
        </Text>
      ) : (
        !editing && (
          <Select
            label={t.parentLabel}
            hint={t.parentHint}
            options={parentOptions}
            value={parentId}
            onChange={setParentId}
          />
        )
      )}
    </Modal>
  );
};
