import { useState } from 'react';
import { BillingAddressFields } from '@/shared/components';
import { useForm, useLocale, useMessages, useSession } from '@/shared/hooks';
import { authApi, isGovernorate, validateRequired } from '@/shared/utils';
import { SettingsForm } from '../SettingsForm';
import { useSignedInUser } from '../useSignedInUser';

// "Choose my governorate in the billing address".
export const BillingSettings = () => {
  const { text } = useLocale();
  const { fieldError } = useMessages();
  const { setAccount } = useSession();
  const user = useSignedInUser();
  const [saved, setSaved] = useState(false);
  const form = useForm(
    {
      governorate: user.billingAddress?.governorate ?? '',
      city: user.billingAddress?.city ?? '',
      street: user.billingAddress?.street ?? '',
    },
    { governorate: validateRequired, city: validateRequired, street: validateRequired },
  );

  return (
    <SettingsForm
      title={text.account.sections.billing}
      intro={text.account.billing.intro}
      saved={saved}
      submitting={form.submitting}
      requestError={form.requestError}
      onSubmit={form.submit(async ({ governorate, city, street }) => {
        if (!isGovernorate(governorate)) return; // already checked by the form
        setAccount(await authApi.updateBillingAddress({ governorate, city: city.trim(), street: street.trim() }));
        setSaved(true);
      })}
    >
      <BillingAddressFields
        values={form.values}
        errors={{
          governorate: fieldError(form.errors.governorate),
          city: fieldError(form.errors.city),
          street: fieldError(form.errors.street),
        }}
        onChange={(name, value) => form.setValue(name, value)}
      />
    </SettingsForm>
  );
};
