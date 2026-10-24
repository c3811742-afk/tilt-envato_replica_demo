import type { FormEvent, ReactNode } from 'react';
import { FormFooter, IconNote, Section, Stack } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

interface SettingsFormProps {
  title: string;
  intro?: string;
  children: ReactNode;
  onSubmit: (event: FormEvent) => void;
  submitting: boolean;
  requestError: unknown;
  saved: boolean; // shows "Changes saved." after a successful save
  submitLabel?: string; // defaults to "Save changes"
}

// One settings form: its title, fields, "Changes saved." after saving, and the save button.
export const SettingsForm = ({ title, intro, children, onSubmit, submitting, requestError, saved, submitLabel }: SettingsFormProps) => {
  const { text } = useLocale();

  return (
    <Section title={title} subtitle={intro} variant="h3" gap={vars.spacing[4]}>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={onSubmit} noValidate>
        {children}
        {saved && <IconNote icon="check" text={text.common.saved} />}
        <FormFooter label={submitLabel ?? text.common.saveChanges} submitting={submitting} requestError={requestError} />
      </Stack>
    </Section>
  );
};
