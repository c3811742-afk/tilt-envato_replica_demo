import { useState } from 'react';
import { Checkbox, EmailField, FormFooter, IconNote, Modal, Select, Stack, Text, TextField } from '@/shared/components';
import { copyrightRoles, supportLimits, type CopyrightRole } from '@/shared/constants';
import { useForm, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item } from '@/shared/types';
import { fillText, originalTitle, supportApi, validateEmail, validateMessage, validateRequired } from '@/shared/utils';

// "Report copyright infringement" on an item: who is reporting, what infringes, and a statement that it's accurate.
export const CopyrightReportDialog = ({ item, onClose }: { item: Item; onClose: () => void }) => {
  const { text } = useLocale();
  const { session, setAccount } = useSession();
  const user = session.status === 'signedIn' ? session.user : null;
  const [reference, setReference] = useState<string>();
  const form = useForm(
    { name: user?.profile?.fullName ?? user?.name ?? '', email: user?.email ?? '', role: copyrightRoles[0] as CopyrightRole, details: '', confirmed: false },
    { name: validateRequired, email: validateEmail, details: validateMessage, confirmed: (value) => (value ? null : 'required') },
  );

  const submit = form.submit(async (values) => {
    const account = await supportApi.reportCopyright({ itemId: item.id, itemTitle: originalTitle(item), ...values });
    setAccount(account);
    setReference(account.user.copyrightReports[0]?.reference);
  });

  return (
    <Modal open onClose={onClose} title={text.copyright.title}>
      {reference ? (
        <IconNote icon="check" text={fillText(text.copyright.sent, { reference })} />
      ) : (
        <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
          <Text color={vars.colors.textMuted}>{text.copyright.intro}</Text>
          <TextField label={text.copyright.name} autoComplete="name" {...form.field('name')} />
          <EmailField label={text.copyright.email} autoComplete="email" {...form.field('email')} />
          <Select
            label={text.copyright.role}
            value={form.values.role}
            onChange={(value) => form.setValue('role', value as CopyrightRole)}
            options={copyrightRoles.map((role) => ({ value: role, label: text.copyright.roles[role] }))}
          />
          <TextField label={text.copyright.details} rows={5} maxLength={supportLimits.messageMaxLength} {...form.field('details')} />
          <Checkbox
            label={text.copyright.confirm}
            checked={form.values.confirmed}
            onChange={(checked) => form.setValue('confirmed', checked)}
            error={form.errors.confirmed ? text.copyright.confirmRequired : undefined}
          />
          <FormFooter label={text.copyright.submit} submitting={form.submitting} requestError={form.requestError} />
        </Stack>
      )}
    </Modal>
  );
};
