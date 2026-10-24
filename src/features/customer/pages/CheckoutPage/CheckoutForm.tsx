import { useState } from 'react';
import {
  Badge,
  BillingAddressFields,
  Button,
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
  paymentMethodIcons,
  paymentMethods,
  planChangePath,
  routes,
  savedPaymentKinds,
  teamMaxMembers,
  type PaymentMethod,
  type SavedPaymentKind,
} from '@/shared/constants';
import { useForm, useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import {
  activeSubscription,
  billingApi,
  fillText,
  formatDate,
  formatNumber,
  formatPercent,
  formatPrice,
  getInstallment,
  isGovernorate,
  paymentBreakdown,
  safeAsync,
  validateCardNumber,
  validateCvc,
  validateEgyptianMobile,
  validateExpiry,
  validateInstapay,
  validateRequired,
  type PaymentChoice,
  type SessionAccount,
} from '@/shared/utils';
import { OrderSummary } from './OrderSummary';
import { PaymentFields, type CheckoutValues } from './PaymentFields';
import { purchaseSubtotal, type Purchase } from './purchase';

interface CheckoutFormProps {
  purchase: Purchase;
  onPaid: (account: SessionAccount) => void;
}

const newMethod = 'new';

const isCardPayment = (method: PaymentMethod) => cardPaymentMethods.includes(method);
const isSavable = (method: PaymentMethod): method is SavedPaymentKind => (savedPaymentKinds as readonly string[]).includes(method);

// New payment details only check their own fields; a saved method needs none.
const forMethod =
  (methods: PaymentMethod[], validate: (value: string) => ReturnType<typeof validateRequired>) =>
  (value: string, values: CheckoutValues) =>
    values.savedMethodId === newMethod && methods.includes(values.method) ? validate(value) : null;

export const CheckoutForm = ({ purchase, onPaid }: CheckoutFormProps) => {
  const { text, locale } = useLocale();
  const { session, setAccount } = useSession();
  const { fieldError, requestError } = useMessages();
  const user = session.status === 'signedIn' ? session.user : null;
  const savedMethods = user?.paymentMethods ?? [];
  const current = activeSubscription(session);
  const cards = [...cardPaymentMethods];
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<{ code: string; rate: number } | null>(null);
  const [promoError, setPromoError] = useState<string>();
  const [checkingPromo, setCheckingPromo] = useState(false);

  const form = useForm<CheckoutValues>(
    {
      method: savedMethods.find((saved) => saved.isDefault)?.kind ?? 'card',
      savedMethodId: savedMethods.find((saved) => saved.isDefault)?.id ?? newMethod,
      saveMethod: true,
      members: String(purchase.kind === 'plan' ? purchase.plan.minMembers : 1),
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvc: '',
      walletPhone: '',
      instapay: '',
      valuPhone: '',
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
      governorate: validateRequired,
      city: validateRequired,
      street: validateRequired,
    },
  );

  const members = Number(form.values.members);
  const student = user?.student != null;
  const breakdown = paymentBreakdown(purchaseSubtotal(purchase, members, student), promo?.rate, user?.balance);
  const installment = purchase.kind === 'plan' ? getInstallment(breakdown.total, purchase.duration) : null;
  const usingSaved = form.values.savedMethodId !== newMethod;
  const method = form.values.method;

  // Someone with a plan changes it from their account (paying only the difference), not by buying a second one.
  if (purchase.kind === 'plan' && current) {
    return (
      <Stack gap={vars.spacing[4]} align="flex-start">
        <IconNote
          text={fillText(text.checkout.replaceNote, { plan: text.pricing.plans[current.planId].name, date: formatDate(current.endsAt, locale) })}
        />
        <Button to={planChangePath(purchase.plan.id)}>{text.checkout.managePlan}</Button>
      </Stack>
    );
  }

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setCheckingPromo(true);
    const result = await safeAsync(() => billingApi.checkPromo(promoInput, purchase.kind === 'plan' ? purchase.plan.id : undefined));
    setCheckingPromo(false);
    setPromoError(result.ok ? undefined : requestError(result.error));
    if (result.ok) setPromo({ code: promoInput.trim().toUpperCase(), rate: result.data });
  };

  const submit = form.submit(async (values) => {
    if (!isGovernorate(values.governorate)) return; // already checked by the form
    const saved = savedMethods.find((candidate) => candidate.id === values.savedMethodId);
    const payment: PaymentChoice = saved
      ? { method: saved.kind, savedMethodId: saved.id }
      : {
          method: values.method,
          cardNumber: isCardPayment(values.method) ? values.cardNumber : undefined,
          holder: values.cardName,
          expiry: values.expiry,
          phone: values.method === 'installments' ? values.valuPhone : values.walletPhone,
          address: values.instapay,
          save: values.saveMethod && isSavable(values.method),
        };
    const billingAddress = { governorate: values.governorate, city: values.city.trim(), street: values.street.trim() };
    const account =
      purchase.kind === 'plan'
        ? await billingApi.subscribe({
            planId: purchase.plan.id,
            duration: purchase.duration,
            members,
            credits: purchase.creditTier?.credits,
            payment,
            autoRenew: values.autoRenew,
            promoCode: promo?.code,
            billingAddress,
          })
        : await billingApi.buyPass({ passId: purchase.pass.id, payment, promoCode: promo?.code, billingAddress });
    setAccount(account);
    onPaid(account);
  });

  const payMethod = usingSaved ? (savedMethods.find((saved) => saved.id === form.values.savedMethodId)?.kind ?? method) : method;
  const submitLabel =
    payMethod === 'fawry'
      ? text.checkout.getFawryCode
      : fillText(text.checkout.pay, { price: formatPrice(payMethod === 'installments' && installment ? installment : breakdown.total, locale) });

  return (
    <SplitLayout
      main={
        <Stack as="form" gap={vars.spacing[6]} onSubmit={submit} noValidate>
          <Section title={purchase.kind === 'plan' ? text.checkout.planTitle : text.checkout.passTitle} variant="h3" gap={vars.spacing[3]}>
            <TextLink to={routes.pricing} variant="bodySm">
              {text.checkout.changePlan}
            </TextLink>
            {purchase.kind === 'plan' && purchase.plan.perMember && (
              <Select
                label={text.checkout.members}
                value={form.values.members}
                onChange={(value) => form.setValue('members', value)}
                options={Array.from({ length: teamMaxMembers - purchase.plan.minMembers + 1 }, (_, index) => {
                  const count = purchase.plan.minMembers + index;
                  return { value: String(count), label: formatNumber(count, locale) };
                })}
              />
            )}
          </Section>

          <Section title={text.checkout.paymentTitle} variant="h3" gap={vars.spacing[3]}>
            {savedMethods.length > 0 && (
              <OptionCardGroup<string>
                label={text.checkout.savedMethods}
                value={form.values.savedMethodId}
                onChange={(next) => {
                  form.setValue('savedMethodId', next);
                  const saved = savedMethods.find((candidate) => candidate.id === next);
                  if (saved) form.setValue('method', saved.kind);
                }}
                options={[
                  ...savedMethods.map((saved) => ({
                    value: saved.id,
                    title: `${text.billingPage.kinds[saved.kind]} ${saved.summary}`,
                    icon: paymentMethodIcons[saved.kind],
                    description: saved.isDefault ? text.billingPage.defaultBadge : undefined,
                  })),
                  { value: newMethod, title: text.checkout.newMethod, icon: 'plus' as const },
                ]}
              />
            )}
            {!usingSaved && (
              <OptionCardGroup<PaymentMethod>
                label={text.checkout.paymentTitle}
                value={method}
                onChange={(next) => form.setValue('method', next)}
                options={paymentMethods.map((option) => ({
                  value: option,
                  title: text.pricing.paymentMethods[option],
                  icon: paymentMethodIcons[option],
                  description: fillText(text.checkout.methodDescriptions[option], { months: formatNumber(installmentMonths, locale) }),
                  // Installments split a yearly plan into monthly payments. A pass starts right away, so it can't wait for Fawry.
                  disabled: (option === 'installments' && installment === null) || (option === 'fawry' && purchase.kind === 'pass'),
                  disabledReason: option === 'fawry' ? text.checkout.passUnavailable : text.checkout.installmentsUnavailable,
                }))}
              >
                <PaymentFields method={method} form={form} />
              </OptionCardGroup>
            )}
            {!usingSaved && isSavable(method) && (
              <Checkbox label={text.checkout.saveMethod} checked={form.values.saveMethod} onChange={(checked) => form.setValue('saveMethod', checked)} />
            )}
            {purchase.kind === 'plan' && isCardPayment(payMethod) && (
              <Checkbox label={text.checkout.autoRenew} checked={form.values.autoRenew} onChange={(checked) => form.setValue('autoRenew', checked)} />
            )}
          </Section>

          <Section title={text.checkout.promoLabel} variant="h3" gap={vars.spacing[3]}>
            {promo ? (
              <Stack direction="row" wrap align="center" gap={vars.spacing[3]}>
                <Badge variant="free">{fillText(text.checkout.promoApplied, { code: promo.code, percent: formatPercent(promo.rate, locale) })}</Badge>
                <Button variant="outline" size="sm" onClick={() => setPromo(null)}>
                  {text.checkout.promoRemove}
                </Button>
              </Stack>
            ) : (
              <TextField
                label={text.checkout.promoLabel}
                direction="ltr"
                value={promoInput}
                onChange={setPromoInput}
                error={promoError}
                endAction={
                  <Button variant="secondary" size="sm" disabled={checkingPromo || !promoInput.trim()} onClick={() => void applyPromo()}>
                    {text.checkout.promoApply}
                  </Button>
                }
              />
            )}
          </Section>

          <Section title={text.billingPage.addressTitle} variant="h3" gap={vars.spacing[3]}>
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
        <OrderSummary
          purchase={purchase}
          members={members}
          student={student}
          breakdown={breakdown}
          promoCode={promo?.code}
          installment={payMethod === 'installments' ? installment : null}
        />
      }
    />
  );
};
