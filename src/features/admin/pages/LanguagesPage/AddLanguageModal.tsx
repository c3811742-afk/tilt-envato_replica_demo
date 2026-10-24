import { useState, type FormEvent } from 'react';
import { addLanguage, adminErrorCode } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { SiteLanguage, TextDirection } from '@/features/admin/types';
import { hasErrors, isBlank, isOneOf, isValidLanguageCode } from '@/features/admin/utils';
import { Button, Modal, Select, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

const directions: readonly TextDirection[] = ['ltr', 'rtl'];

interface AddLanguageModalProps {
  onClose: () => void;
  onAdded: (language: SiteLanguage) => void;
}

export const AddLanguageModal = ({ onClose, onAdded }: AddLanguageModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error, clearError } = useAdminAction();
  const t = text.admin.languages;
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nativeName, setNativeName] = useState('');
  const [direction, setDirection] = useState<TextDirection>('ltr');
  const [submitted, setSubmitted] = useState(false);
  const [codeTaken, setCodeTaken] = useState(false);

  const errors = {
    code: codeTaken ? text.admin.errors.languageExists : isValidLanguageCode(code) ? undefined : t.codeInvalid,
    name: isBlank(name) ? t.nameRequired : undefined,
    nativeName: isBlank(nativeName) ? t.nativeNameRequired : undefined,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;
    const result = await run(() => addLanguage(currentAdmin.id, { code, name, nativeName, direction }));
    if (result.ok) {
      onAdded(result.data);
      return;
    }
    // A taken code belongs to the code field; anything else is shown above the form.
    if (adminErrorCode(result.error) === 'languageExists') {
      clearError();
      setCodeTaken(true);
    }
  };

  return (
    <Modal
      open
      title={t.add}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {t.add}
          </Button>
        </>
      }
    >
      <Notice tone="info">{t.addMessage}</Notice>
      {error && <Notice tone="danger">{error}</Notice>}
      <TextField
        label={t.codeLabel}
        hint={t.codeHint}
        value={code}
        onChange={(value) => {
          setCode(value);
          setCodeTaken(false);
        }}
        error={submitted ? errors.code : undefined}
        direction="ltr"
        required
      />
      <TextField
        label={t.nameLabel}
        value={name}
        onChange={setName}
        error={submitted ? errors.name : undefined}
        direction="ltr"
        required
      />
      <TextField
        label={t.nativeNameLabel}
        hint={t.nativeNameHint}
        value={nativeName}
        onChange={setNativeName}
        error={submitted ? errors.nativeName : undefined}
        required
      />
      <Select
        label={t.directionLabel}
        options={directions.map((value) => ({ value, label: t.directions[value] }))}
        value={direction}
        onChange={(value) => isOneOf(directions, value) && setDirection(value)}
      />
    </Modal>
  );
};
