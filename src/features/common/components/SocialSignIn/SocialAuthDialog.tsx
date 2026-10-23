import { EmailField, FormFooter, IconNote, Modal, Stack, TextField } from '@/shared/components';
import type { SocialProvider } from '@/shared/constants';
import { useForm, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, validateEmail, validateRequired } from '@/shared/utils';

export interface SocialDetails {
  name: string;
  email: string;
}

interface SocialAuthDialogProps {
  provider: SocialProvider;
  askName: boolean; // a new account needs the name the provider would share
  onContinue: (details: SocialDetails) => Promise<void>; // sign in, sign up or link; a thrown error is shown in the dialog
  onClose: () => void;
}

// Demo stand-in for the Google / Apple / Facebook window: asks for the name and email the provider would share.
export const SocialAuthDialog = ({ provider, askName, onContinue, onClose }: SocialAuthDialogProps) => {
  const { text } = useLocale();
  const providerName = text.providers[provider];
  const form = useForm({ name: '', email: '' }, { name: askName ? validateRequired : undefined, email: validateEmail });

  return (
    <Modal open onClose={onClose} title={fillText(text.auth.continueWith, { provider: providerName })}>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={form.submit(onContinue)} noValidate>
        <IconNote icon="info" text={fillText(text.auth.social.demoNote, { provider: providerName })} />
        {askName && <TextField label={text.auth.social.name} autoComplete="name" autoFocus {...form.field('name')} />}
        <EmailField autoFocus={!askName} {...form.field('email')} />
        <FormFooter label={text.common.continue} submitting={form.submitting} requestError={form.requestError} />
      </Stack>
    </Modal>
  );
};
