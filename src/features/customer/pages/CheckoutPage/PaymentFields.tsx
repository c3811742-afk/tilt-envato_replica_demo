import { IconNote, PhoneField, Stack, Text, TextField } from '@/shared/components';
import { card, cardPaymentMethods, fawry, type PaymentMethod } from '@/shared/constants';
import { useLocale, type useForm } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatCardNumber, formatExpiry, formatNumber, keepDigits } from '@/shared/utils';

export type CheckoutValues = {
  method: PaymentMethod;
  members: string;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvc: string;
  walletPhone: string;
  instapay: string;
  valuPhone: string;
  savedMethodId: string; // a saved method to pay with; empty: new payment details
  saveMethod: boolean; // keep the new details on the account
  autoRenew: boolean;
  governorate: string;
  city: string;
  street: string;
};

interface PaymentFieldsProps {
  method: PaymentMethod;
  form: ReturnType<typeof useForm<CheckoutValues>>;
}

// The details each payment method needs, shown under the selected method.
export const PaymentFields = ({ method, form }: PaymentFieldsProps) => {
  const { text, locale } = useLocale();

  if (cardPaymentMethods.includes(method)) {
    return (
      <Stack gap={vars.spacing[4]}>
        <IconNote icon="card" text={fillText(text.checkout.cardDemo, { number: card.demoNumber, declined: card.declinedNumber })} />
        <TextField
          label={text.checkout.cardNumber}
          inputMode="numeric"
          direction="ltr"
          autoComplete="cc-number"
          {...form.field('cardNumber')}
          onChange={(value) => form.setValue('cardNumber', formatCardNumber(value))}
        />
        <TextField label={text.checkout.cardName} autoComplete="cc-name" {...form.field('cardName')} />
        <Stack direction="row" gap={vars.spacing[3]}>
          <Stack grow>
            <TextField
              label={text.checkout.expiry}
              inputMode="numeric"
              direction="ltr"
              placeholder={text.checkout.expiryPlaceholder}
              autoComplete="cc-exp"
              {...form.field('expiry')}
              onChange={(value) => form.setValue('expiry', formatExpiry(value))}
            />
          </Stack>
          <Stack grow>
            <TextField
              label={text.checkout.cvc}
              inputMode="numeric"
              direction="ltr"
              autoComplete="cc-csc"
              {...form.field('cvc')}
              onChange={(value) => form.setValue('cvc', keepDigits(value, card.cvcLength.max))}
            />
          </Stack>
        </Stack>
      </Stack>
    );
  }

  switch (method) {
    case 'wallet':
      return <PhoneField label={text.checkout.walletPhone} hint={text.checkout.walletHint} {...form.field('walletPhone')} />;
    case 'instapay':
      return (
        <TextField
          label={text.checkout.instapayAddress}
          direction="ltr"
          placeholder={text.checkout.instapayPlaceholder}
          {...form.field('instapay')}
        />
      );
    case 'installments':
      return <PhoneField label={text.checkout.valuPhone} {...form.field('valuPhone')} />;
    case 'fawry':
      return (
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {fillText(text.checkout.fawryHint, { hours: formatNumber(fawry.payWithinHours, locale) })}
        </Text>
      );
    default:
      return null;
  }
};
