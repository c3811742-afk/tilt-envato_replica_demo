import { Button, Card, CodeBadge, FormFooter, Icon, Stack, Text } from '@/shared/components';
import { accountPath, routes } from '@/shared/constants';
import { useForm, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { billingApi, fillText, formatDate, formatPrice, type SessionAccount } from '@/shared/utils';
import type { Purchase } from './purchase';

interface CheckoutResultProps {
  purchase: Purchase;
  account: SessionAccount; // the account right after paying
  onPaid: (account: SessionAccount) => void; // the Fawry payment was confirmed
}

const payByFormat: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

// After paying: "You're subscribed" (or the pass is active), or the Fawry code to pay when the payment is still pending.
export const CheckoutResult = ({ purchase, account, onPaid }: CheckoutResultProps) => {
  const { text, locale } = useLocale();
  const { setAccount } = useSession();
  const form = useForm({});
  const { subscription, pass } = account;

  const markPaid = form.submit(async () => {
    const updated = await billingApi.confirmFawryPayment();
    setAccount(updated);
    onPaid(updated);
  });

  if (purchase.kind === 'plan' && subscription?.status === 'pendingPayment') {
    return (
      <Card gap={vars.spacing[4]} padding={vars.spacing[6]}>
        <Icon name="receipt" size={vars.sizes.icon.xl} color={vars.colors.primary} />
        <Text as="h2" variant="h2">
          {text.checkout.pendingTitle}
        </Text>
        <Text>
          {fillText(text.checkout.pendingMessage, {
            price: formatPrice(account.user.invoices[0]?.total ?? subscription.total, locale),
            date: subscription.payBy ? formatDate(subscription.payBy, locale, payByFormat) : '',
          })}
        </Text>
        <Stack gap={vars.spacing[2]} align="flex-start">
          <Text variant="label" color={vars.colors.textMuted}>
            {text.checkout.fawryCode}
          </Text>
          <CodeBadge code={subscription.fawryCode} size="lg" />
        </Stack>
        <Stack as="form" onSubmit={markPaid} noValidate>
          <FormFooter label={text.checkout.markPaid} submitting={form.submitting} requestError={form.requestError} />
        </Stack>
      </Card>
    );
  }

  const title = purchase.kind === 'plan' ? text.checkout.successTitle : text.checkout.passSuccessTitle;
  const message =
    purchase.kind === 'plan'
      ? fillText(text.checkout.successMessage, { plan: text.pricing.plans[purchase.plan.id].name, date: formatDate(subscription?.endsAt ?? '', locale) })
      : fillText(text.checkout.passSuccessMessage, { pass: text.pricing.passes[purchase.pass.id].name, date: formatDate(pass?.endsAt ?? '', locale) });

  return (
    <Card gap={vars.spacing[4]} padding={vars.spacing[6]}>
      <Icon name="check" size={vars.sizes.icon.xl} color={vars.colors.primary} />
      <Text as="h2" variant="h2">
        {title}
      </Text>
      <Text>{message}</Text>
      <Stack direction="row" wrap gap={vars.spacing[3]}>
        <Button to={routes.search}>{text.home.cta}</Button>
        <Button variant="outline" to={accountPath('billing')}>
          {text.checkout.viewInvoice}
        </Button>
      </Stack>
    </Card>
  );
};
