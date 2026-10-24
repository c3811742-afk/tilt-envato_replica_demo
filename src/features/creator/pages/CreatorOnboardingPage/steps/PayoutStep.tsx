import { Grid, OptionCardGroup, PhoneField, Section, Select, Stack, TextField } from '@/shared/components';
import { egyptianBanks } from '@/shared/constants';
import { vars } from '@/shared/theme';
import type { PayoutMethod, TaxStatus } from '@/shared/types';
import type { OnboardingStepProps } from '../onboardingModel';
import { useStepText } from './useStepText';

const payoutMethods: { value: PayoutMethod; icon: 'building' | 'phone' | 'wallet' }[] = [
  { value: 'bankTransfer', icon: 'building' },
  { value: 'instapay', icon: 'phone' },
  { value: 'vodafoneCash', icon: 'wallet' },
];
const taxStatuses: { value: TaxStatus; icon: 'user' | 'receipt' }[] = [
  { value: 'individual', icon: 'user' },
  { value: 'business', icon: 'receipt' },
];

// Laid out like the checkout's payment section: a titled section per choice, the details under the selected option.
export const PayoutStep = ({ values, errors, update }: OnboardingStepProps) => {
  const { text, t, errorFor } = useStepText(errors);
  const p = t.payout;

  return (
    <Grid columns={2} gap={vars.spacing[6]}>
      <Section title={p.methodLabel} variant="h3" gap={vars.spacing[3]}>
        <OptionCardGroup<PayoutMethod>
          label={p.methodLabel}
          options={payoutMethods.map(({ value, icon }) => ({
            value,
            icon,
            title: p.methods[value].label,
            description: p.methods[value].description,
          }))}
          value={values.payoutMethod}
          onChange={(method) => update('payoutMethod', method)}
        >
          {values.payoutMethod === 'bankTransfer' && (
            <Stack gap={vars.spacing[4]}>
              <Select
                label={p.bankNameLabel}
                placeholder={p.bankNamePlaceholder}
                value={values.bankName}
                options={egyptianBanks.map((bank) => ({ value: bank, label: text.banks[bank] }))}
                onChange={(bank) => update('bankName', bank)}
                error={errorFor('bankName')}
              />
              <TextField
                autoComplete="name"
                label={p.accountHolderLabel}
                value={values.accountHolder}
                onChange={(holder) => update('accountHolder', holder)}
                error={errorFor('accountHolder')}
              />
              <TextField
                direction="ltr"
                label={p.ibanLabel}
                hint={p.ibanHint}
                placeholder={p.ibanPlaceholder}
                value={values.iban}
                onChange={(iban) => update('iban', iban)}
                error={errorFor('iban')}
              />
            </Stack>
          )}
          {values.payoutMethod === 'instapay' && (
            <TextField
              direction="ltr"
              label={p.instapayLabel}
              placeholder={p.instapayHint}
              value={values.instapayAddress}
              onChange={(address) => update('instapayAddress', address)}
              error={errorFor('instapayAddress')}
            />
          )}
          {values.payoutMethod === 'vodafoneCash' && (
            <PhoneField
              label={p.walletLabel}
              hint={p.walletHint}
              value={values.walletNumber}
              onChange={(number) => update('walletNumber', number)}
              error={errorFor('walletNumber')}
            />
          )}
        </OptionCardGroup>
      </Section>

      <Section title={p.taxStatusLabel} variant="h3" gap={vars.spacing[3]}>
        <OptionCardGroup<TaxStatus>
          label={p.taxStatusLabel}
          options={taxStatuses.map(({ value, icon }) => ({
            value,
            icon,
            title: p.taxStatuses[value].label,
            description: p.taxStatuses[value].description,
          }))}
          value={values.taxStatus}
          onChange={(status) => update('taxStatus', status)}
        >
          {values.taxStatus === 'business' && (
            <TextField
              direction="ltr"
              inputMode="numeric"
              label={p.taxNumberLabel}
              hint={p.taxNumberHint}
              value={values.taxNumber}
              onChange={(number) => update('taxNumber', number)}
              error={errorFor('taxNumber')}
            />
          )}
        </OptionCardGroup>
      </Section>
    </Grid>
  );
};
