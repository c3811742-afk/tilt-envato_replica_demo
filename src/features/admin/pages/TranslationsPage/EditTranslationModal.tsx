import { useState, type FormEvent } from 'react';
import { saveTranslation } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { SiteLanguage, TranslationEntry } from '@/features/admin/types';
import { fillText, formatList, isBlank, placeholdersOf, samePlaceholders } from '@/features/admin/utils';
import { Button, Modal, Stack, Text, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

interface EditTranslationModalProps {
  language: SiteLanguage;
  entry: TranslationEntry;
  onClose: () => void;
  onSaved: (entry: TranslationEntry) => void;
}

// Shows the English text next to the translation. {placeholders} must stay, or names and numbers go missing.
export const EditTranslationModal = ({ language, entry, onClose, onSaved }: EditTranslationModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.translations;
  const [value, setValue] = useState(entry.value);
  const [submitted, setSubmitted] = useState(false);
  const placeholders = placeholdersOf(entry.source).map((name) => `{${name}}`);

  const fieldError = isBlank(value)
    ? t.valueRequired
    : samePlaceholders(entry.source, value)
      ? undefined
      : fillText(t.placeholdersChanged, { list: formatList(placeholders, locale) });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (fieldError) return;
    const result = await run(() => saveTranslation(currentAdmin.id, language.code, entry.key, value));
    if (result.ok) onSaved(result.data);
  };

  return (
    <Modal
      open
      title={t.editTitle}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {text.common.saveChanges}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <Stack gap={vars.spacing[1]}>
        <Text variant="label">{text.admin.columns.key}</Text>
        <Text color={vars.colors.textMuted}>
          <bdi>{entry.key}</bdi>
        </Text>
      </Stack>
      <Stack gap={vars.spacing[1]}>
        <Text variant="label">{text.admin.languageNames.en}</Text>
        <Text>
          <bdi lang="en">{entry.source}</bdi>
        </Text>
      </Stack>
      <TextField rows={4}
        label={language.name}
        hint={placeholders.length > 0 ? fillText(t.placeholdersHint, { list: formatList(placeholders, locale) }) : undefined}
        value={value}
        onChange={setValue}
        error={submitted ? fieldError : undefined}
        lang={language.code}
        direction={language.direction}
        required
      />
    </Modal>
  );
};
