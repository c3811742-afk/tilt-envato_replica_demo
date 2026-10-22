import { Button, Card, CodeBadge, FormFooter, Icon, IconNote, Stack, Text } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useForm, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Plan, Subscription } from '@/shared/types';
import { authApi, fillText, formatDate, formatPrice } from '@/shared/utils';

interface CheckoutResultProps {
  plan: Plan;
  subscription: Subscription;
  onPaid: (subscription: Subscription) => void; // the Fawry payment was confirmed
}

const payByFormat: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

// After paying: "You're subscribed", or the Fawry code to pay when the payment is still pending.
export const CheckoutResult = ({ plan, subscription, onPaid }: CheckoutResultProps) => {
  const { text, locale } = useLocale();
  const { setAccount } = useSession();
  const form = useForm({});
  const planName = text.pricing.plans[plan.id].name;

  const markPaid = form.submit(async () => {
    const account = await authApi.confirmFawryPayment();
    setAccount(account);
    if (account.subscription) onPaid(account.subscription);
  });

  if (subscription.status === 'pendingPayment') {
    return (
      <Card gap={vars.spacing[4]} padding={vars.spacing[6]}>
        <Icon name="receipt" size={vars.sizes.icon.xl} color={vars.colors.primary} />
        <Text as="h2" variant="h2">
          {text.checkout.pendingTitle}
        </Text>
        <Text>
          {fillText(text.checkout.pendingMessage, {
            price: formatPrice(subscription.total, locale),
            date: subscription.payBy ? formatDate(subscription.payBy, locale, payByFormat) : '',
          })}
        </Text>
        <Stack gap={vars.spacing[2]} align="flex-start">
          <Text variant="label" color={vars.colors.textMuted}>
            {text.checkout.fawryCode}
          </Text>
          <CodeBadge code={subscription.fawryCode} size="lg" />
        </Stack>
        <IconNote text={text.checkout.pendingDemoNote} />
        <Stack as="form" onSubmit={markPaid} noValidate>
          <FormFooter label={text.checkout.markPaid} submitting={form.submitting} requestError={form.requestError} />
        </Stack>
      </Card>
    );
  }

  return (
    <Card gap={vars.spacing[4]} padding={vars.spacing[6]}>
      <Icon name="check" size={vars.sizes.icon.xl} color={vars.colors.primary} />
      <Text as="h2" variant="h2">
        {text.checkout.successTitle}
      </Text>
      <Text>{fillText(text.checkout.successMessage, { plan: planName, date: formatDate(subscription.endsAt, locale) })}</Text>
      <Stack direction="row" wrap gap={vars.spacing[3]}>
        <Button to={routes.search}>{text.home.cta}</Button>
        <Button variant="outline" to={routes.home}>
          {text.common.backToHome}
        </Button>
      </Stack>
    </Card>
  );
};
