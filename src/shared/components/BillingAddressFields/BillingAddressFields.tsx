import { governorates } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { FieldMessage } from '../FieldMessage';
import { Select } from '../Select';
import { Stack } from '../Stack';
import { TextField } from '../TextField';
import { billingAddressFieldsDefaults } from './BillingAddressFields.defaults';
import type { BillingAddressFieldsProps } from './BillingAddressFields.types';

// Billing address with the governorate list (checkout and the account's billing settings).
export const BillingAddressFields = (props: BillingAddressFieldsProps) => {
  const { values, errors, onChange } = withDefaults(billingAddressFieldsDefaults, props);
  const { text } = useLocale();

  return (
    <Stack gap={vars.spacing[4]}>
      <Stack gap={vars.spacing[1]}>
        <Select
          label={text.account.billing.governorate}
          value={values.governorate}
          onChange={(value) => onChange?.('governorate', value)}
          options={[
            { value: '', label: text.account.billing.chooseGovernorate },
            ...governorates.map((governorate) => ({ value: governorate, label: text.governorates[governorate] })),
          ]}
        />
        <FieldMessage tone="error" message={errors.governorate} />
      </Stack>
      <TextField
        label={text.account.billing.city}
        autoComplete="address-level2"
        value={values.city}
        onChange={(value) => onChange?.('city', value)}
        error={errors.city}
      />
      <TextField
        label={text.account.billing.street}
        autoComplete="street-address"
        value={values.street}
        onChange={(value) => onChange?.('street', value)}
        error={errors.street}
      />
    </Stack>
  );
};
