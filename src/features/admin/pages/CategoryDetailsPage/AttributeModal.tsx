import { useState, type FormEvent } from 'react';
import { saveAttribute } from '@/features/admin/api';
import { LocalizedField } from '@/features/admin/components';
import { attributeTypes, typesWithOptions } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { AttributeType, Category, CategoryAttribute } from '@/features/admin/types';
import { emptyLocalized, hasErrors, localizedErrors, parseOptions } from '@/features/admin/utils';
import { Checkbox, Modal, ModalActions, Notice, Select, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { isOneOf } from '@/shared/utils';

// Options make sense only when there are at least two to choose from.
const minOptions = 2;

interface AttributeModalProps {
  categoryId: string;
  attribute?: CategoryAttribute; // editing; adding when missing
  onClose: () => void;
  onSaved: (category: Category) => void;
}

export const AttributeModal = ({ categoryId, attribute, onClose, onSaved }: AttributeModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
  const t = text.admin.categoryDetails;
  const [name, setName] = useState(attribute?.name ?? emptyLocalized());
  const [type, setType] = useState<AttributeType>(attribute?.type ?? 'single');
  const [options, setOptions] = useState(attribute?.options.join(', ') ?? '');
  const [isFilter, setIsFilter] = useState(attribute?.isFilter ?? true);
  const [submitted, setSubmitted] = useState(false);

  const nameErrors = localizedErrors(name, text);
  const needsOptions = typesWithOptions.includes(type);
  const optionList = needsOptions ? parseOptions(options) : [];
  const optionsMissing = needsOptions && optionList.length < minOptions;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(nameErrors) || optionsMissing) return;
    const input = { name, type, options: optionList, isFilter };
    const result = await run(() => saveAttribute(currentAdmin.id, categoryId, input, attribute?.id));
    if (result.ok) onSaved(result.data);
  };

  return (
    <Modal
      open
      title={attribute ? t.editAttributeTitle : t.addAttribute}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <ModalActions confirmLabel={attribute ? text.common.saveChanges : t.addAttribute} onCancel={onClose} submit busy={pending} />
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <LocalizedField
        label={t.attributeNameLabel}
        value={name}
        onChange={setName}
        required
        errors={submitted ? nameErrors : {}}
      />
      <Select
        label={t.typeLabel}
        options={attributeTypes.map((value) => ({ value, label: text.admin.attributeTypes[value] }))}
        value={type}
        onChange={(value) => isOneOf(value, attributeTypes) && setType(value)}
      />
      {needsOptions && (
        <TextField
          label={t.optionsLabel}
          hint={t.optionsHint}
          value={options}
          onChange={setOptions}
          error={submitted && optionsMissing ? t.optionsRequired : undefined}
          required
        />
      )}
      <Checkbox label={t.isFilterLabel} description={t.isFilterHint} checked={isFilter} onChange={setIsFilter} />
    </Modal>
  );
};
