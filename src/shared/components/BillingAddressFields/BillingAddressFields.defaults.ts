import type { BillingAddressFieldsProps } from './BillingAddressFields.types';

export const billingAddressFieldsDefaults: Required<Pick<BillingAddressFieldsProps, 'values' | 'errors'>> = {
  values: { governorate: '', city: '', street: '' },
  errors: {},
};
