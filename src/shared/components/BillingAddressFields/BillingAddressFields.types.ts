export interface BillingAddressValues {
  governorate: string; // a Governorate id, or '' while none is chosen
  city: string;
  street: string;
}

export interface BillingAddressFieldsProps {
  values?: BillingAddressValues;
  errors?: Partial<Record<keyof BillingAddressValues, string>>; // messages shown under each field
  onChange?: (name: keyof BillingAddressValues, value: string) => void;
}
