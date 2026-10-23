import { useState } from 'react';
import { EmailField, FormFooter, IconNote, Page, PhoneField, Select, Stack, TextField } from '@/shared/components';
import { salesTeamSizes, type SalesTeamSize } from '@/shared/constants';
import { useForm, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { billingApi, validateEgyptianMobile, validateEmail, validateRequired } from '@/shared/utils';

// "Enterprise: contact sales": the organization's details, sent to the sales team.
export const ContactSalesPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const user = session.status === 'signedIn' ? session.user : null;
  const [sent, setSent] = useState(false);
  const form = useForm(
    {
      name: user?.profile?.fullName ?? user?.name ?? '',
      company: '',
      email: user?.email ?? '',
      phone: user?.profile?.phone ?? '',
      teamSize: salesTeamSizes[0] as SalesTeamSize,
      message: '',
    },
    { name: validateRequired, company: validateRequired, email: validateEmail, phone: validateEgyptianMobile },
  );

  const submit = form.submit(async (values) => {
    await billingApi.contactSales({ ...values, name: values.name.trim(), company: values.company.trim(), message: values.message.trim() });
    setSent(true);
  });

  return (
    <Page title={text.contactSales.title} subtitle={text.contactSales.subtitle} contentMaxWidth={vars.sizes.authForm.maxWidth}>
      {sent ? (
        <IconNote icon="check" text={text.contactSales.sent} />
      ) : (
        <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
          <TextField label={text.contactSales.name} autoComplete="name" {...form.field('name')} />
          <TextField label={text.contactSales.company} autoComplete="organization" {...form.field('company')} />
          <EmailField label={text.contactSales.email} autoComplete="email" {...form.field('email')} />
          <PhoneField label={text.contactSales.phone} {...form.field('phone')} />
          <Select
            label={text.contactSales.teamSize}
            value={form.values.teamSize}
            onChange={(value) => form.setValue('teamSize', value as SalesTeamSize)}
            options={salesTeamSizes.map((size) => ({ value: size, label: text.contactSales.teamSizes[size] }))}
          />
          <TextField label={text.contactSales.message} rows={4} {...form.field('message')} />
          <FormFooter label={text.contactSales.submit} submitting={form.submitting} requestError={form.requestError} />
        </Stack>
      )}
    </Page>
  );
};
