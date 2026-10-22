import {
  BillingAddressFields,
  Checkbox,
  FormFooter,
  IconNote,
  OptionCardGroup,
  Section,
  Select,
  SplitLayout,
  Stack,
  TextField,
  TextLink,
} from '@/shared/components';
import {
  cardPaymentMethods,
  installmentMonths,
  installmentMinTotal,
  paymentMethodIcons,
  paymentMethods,
  routes,
  teamMaxMembers,
  type PaymentMethod,
  type PlanDuration,
} from '@/shared/constants';
import { useForm, useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Plan, Subscription } from '@/shared/types';
import {
  activeSubscription,
  authApi,
  fillText,
  formatDate,
  formatNumber,
  formatPrice,
  getInstallment,
  getSubscriptionTotal,
  isGovernorate,
  validateCardNumber,
  validateCvc,
  validateEgyptianMobile,
  validateExpiry,
  validateInstapay,
  validateRequired,
} from '@/shared/utils';
import { OrderSummary } from './OrderSummary';
import { PaymentFields, type CheckoutValues } from './PaymentFields';

interface CheckoutFormProps {
  plan: Plan;
  duration: PlanDuration;
  onSubscribed: (subscription: Subscription) => void;
}

const isCardPayment = (method: PaymentMethod) => cardPaymentMethods.includes(method);

// Each payment method only checks its own fields.
const forMethod =
  (methods: PaymentMethod[], validate: (value: string) => ReturnType<typeof validateRequired>) =>
  (value: string, values: CheckoutValues) =>
    methods.includes(values.method) ? validate(value) : null;

export const CheckoutForm = ({ plan, duration, onSubscribed }: CheckoutFormProps) => {
  const { text, locale } = useLocale();
  const { session, setAccount } = useSession();
  const { fieldError } = useMessages();
  const user = session.status === 'signedIn' ? session.user : null;
  const current = activeSubscription(session);
  const needsStudentId = plan.id === 'student' && !user?.profile?.studentId;
  const cards = [...cardPaymentMethods];

  const form = useForm<CheckoutValues>(
    {
      method: 'card',
      members: String(plan.minMembers),
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvc: '',
      walletPhone: '',
      instapay: '',
      valuPhone: '',
      studentId: '',
      autoRenew: false,
      // Billing address: filled in from the last one saved
      governorate: user?.billingAddress?.governorate ?? '',
      city: user?.billingAddress?.city ?? '',
      street: user?.billingAddress?.street ?? '',
    },
    {
      cardNumber: forMethod(cards, validateCardNumber),
      cardName: forMethod(cards, validateRequired),
      expiry: forMethod(cards, (value) => validateExpiry(value)),
      cvc: forMethod(cards, validateCvc),
      walletPhone: forMethod(['wallet'], validateEgyptianMobile),
      instapay: forMethod(['instapay'], validateInstapay),
      valuPhone: forMethod(['installments'], validateEgyptianMobile),
      studentId: (value) => (needsStudentId ? validateRequired(value) : null),
      governorate: validateRequired,
      city: validateRequired,
      street: validateRequired,
    },
  );

  const members = Number(form.values.members);
  const total = getSubscriptionTotal(plan, duration, members);
  const installment = getInstallment(total);
  const method = form.values.method;

  const submit = form.submit(async (values) => {
    if (!isGovernorate(values.governorate)) return; // already checked by the form
    const account = await authApi.subscribe({
      planId: plan.id,
      duration,
      members,
      paymentMethod: values.method,
      autoRenew: values.autoRenew,
      studentId: values.studentId,
      billingAddress: { governorate: values.governorate, city: values.city.trim(), street: values.street.trim() },
    });
    setAccount(account);
    if (account.subscription) onSubscribed(account.subscription);
  });

  const submitLabel =
    method === 'fawry'
      ? text.checkout.getFawryCode
      : fillText(text.checkout.pay, { price: formatPrice(method === 'installments' && installment ? installment : total, locale) });

  return (
    <SplitLayout
      main={
        <Stack as="form" gap={vars.spacing[6]} onSubmit={submit} noValidate>
          {current && (
            <IconNote
              text={fillText(text.checkout.replaceNote, {
                plan: text.pricing.plans[current.planId].name,
                date: formatDate(current.endsAt, locale),
              })}
            />
          )}

          <Section title={text.checkout.planTitle} variant="h3" gap={vars.spacing[3]}>
            <TextLink to={routes.pricing} variant="bodySm">
              {text.checkout.changePlan}
            </TextLink>
            {plan.perMember && (
              <Select
                label={text.checkout.members}
                value={form.values.members}
                onChange={(value) => form.setValue('members', value)}
                options={Array.from({ length: teamMaxMembers - plan.minMembers + 1 }, (_, index) => {
                  const count = plan.minMembers + index;
                  return { value: String(count), label: formatNumber(count, locale) };
                })}
              />
            )}
            {needsStudentId && (
              <TextField label={text.profile.studentId} hint={text.checkout.studentIdNeeded} direction="ltr" {...form.field('studentId')} />
            )}
          </Section>

          <Section title={text.checkout.paymentTitle} variant="h3" gap={vars.spacing[3]}>
            <OptionCardGroup<PaymentMethod>
              label={text.checkout.paymentTitle}
              value={method}
              onChange={(next) => form.setValue('method', next)}
              options={paymentMethods.map((option) => ({
                value: option,
                title: text.pricing.paymentMethods[option],
                icon: paymentMethodIcons[option],
                description: fillText(text.checkout.methodDescriptions[option], { months: formatNumber(installmentMonths, locale) }),
                // Installments only make sense for bigger totals (12-month and team plans).
                disabled: option === 'installments' && installment === null,
                disabledReason: fillText(text.checkout.installmentsUnavailable, { price: formatPrice(installmentMinTotal, locale) }),
              }))}
            >
              <PaymentFields method={method} form={form} />
            </OptionCardGroup>
            {isCardPayment(method) && (
              <Checkbox
                label={text.checkout.autoRenew}
                checked={form.values.autoRenew}
                onChange={(checked) => form.setValue('autoRenew', checked)}
              />
            )}
          </Section>

          <Section title={text.account.sections.billing} variant="h3" gap={vars.spacing[3]}>
            <BillingAddressFields
              values={{ governorate: form.values.governorate, city: form.values.city, street: form.values.street }}
              errors={{
                governorate: fieldError(form.errors.governorate),
                city: fieldError(form.errors.city),
                street: fieldError(form.errors.street),
              }}
              onChange={(name, value) => form.setValue(name, value)}
            />
          </Section>

          <FormFooter label={submitLabel} submitting={form.submitting} requestError={form.requestError} />
        </Stack>
      }
      aside={
        <OrderSummary plan={plan} duration={duration} members={members} installment={method === 'installments' ? installment : null} />
      }
    />
  );
};
