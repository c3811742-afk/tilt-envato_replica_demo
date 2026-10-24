import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { AsyncContent, Badge, Button, Card, Checkbox, CodeBadge, FieldMessage, IconNote, Modal, Section, Stack, Text } from '@/shared/components';
import { cardPaymentMethods, planChangeParam, routes } from '@/shared/constants';
import { useAccountAction, useAsync, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { PlanId, Subscription } from '@/shared/types';
import { api, billingApi, fillText, formatDate, formatNumber, isSubscriptionActive, type SessionAccount } from '@/shared/utils';
import { ChangePlanDialog } from './plan/ChangePlanDialog';
import { StudentVerification } from './plan/StudentVerification';
import { UsageMeters } from './plan/UsageMeters';

type Dialog = { kind: 'change'; planId?: PlanId } | { kind: 'seats' } | { kind: 'cancel' } | null;

// "Plan and credits": the current plan and what it costs, renew, cancel or keep it, change plan or seats
// (with the new price confirmed first), downloads and AI credits left, the project pass and the student price.
export const PlanSettings = () => {
  const { text, price } = useLocale();
  const { session } = useSession();
  const [params, setParams] = useSearchParams();
  const plans = useAsync(api.getPlans, []);
  // "Switch to this plan" on the pricing page opens the change dialog on that plan.
  const requested = params.get(planChangeParam) as PlanId | null;
  const [dialog, setDialog] = useState<Dialog>(requested ? { kind: 'change', planId: requested } : null);
  if (session.status !== 'signedIn') return null; // the account pages are only shown to signed-in users
  const { user, subscription, team } = session;
  const active = isSubscriptionActive(subscription) ? subscription : null;
  // A member using their team's plan sees it, but the owner manages it.
  const teamManaged = team?.usesTeamPlan && team.role !== 'owner' ? team : null;

  const closeDialog = () => {
    setDialog(null);
    if (requested) setParams({}, { replace: true });
  };

  return (
    <Section title={text.account.sections.plan} variant="h3" gap={vars.spacing[5]}>
      {teamManaged ? (
        <IconNote icon="users" title={teamManaged.name} text={fillText(text.planPage.teamPlanNote, { team: teamManaged.name, owner: teamManaged.ownerName })} />
      ) : subscription?.status === 'pendingPayment' ? (
        <PendingPlan subscription={subscription} />
      ) : active ? (
        <CurrentPlan subscription={active} onDialog={setDialog} />
      ) : (
        <Card gap={vars.spacing[3]}>
          <Text as="h3" variant="h4">
            {text.planPage.noPlanTitle}
          </Text>
          <Text color={vars.colors.textMuted}>{text.planPage.noPlanText}</Text>
          <div>
            <Button to={routes.pricing}>{text.common.viewPlans}</Button>
          </div>
        </Card>
      )}

      {user.balance > 0 && <IconNote icon="wallet" text={fillText(text.planPage.balance, { price: price(user.balance) })} />}

      <UsageMeters session={session} />
      <StudentVerification user={user} />

      {active && !teamManaged && dialog && (dialog.kind === 'change' || dialog.kind === 'seats') && (
        <AsyncContent state={plans}>
          {(data) => (
            <ChangePlanDialog
              plans={data.filter((plan) => plan.monthlyPrice !== null)}
              subscription={active}
              initialPlanId={dialog.kind === 'change' ? dialog.planId : undefined}
              seatsOnly={dialog.kind === 'seats'}
              onClose={closeDialog}
            />
          )}
        </AsyncContent>
      )}
      {active && dialog?.kind === 'cancel' && <CancelDialog subscription={active} onClose={closeDialog} />}
    </Section>
  );
};

// Runs one plan action (renew, cancel, keep, auto-renew) and keeps the account in sync; shows why it failed.
const usePlanAction = () => {
  const { busy, error, run: runAction } = useAccountAction();
  const [done, setDone] = useState<string>();
  const run = async (action: () => Promise<SessionAccount>, doneText?: (account: SessionAccount) => string) => {
    const account = await runAction(action);
    setDone(account && doneText ? doneText(account) : undefined);
    return account !== null;
  };
  return { busy, error, done, run };
};

const CurrentPlan = ({ subscription, onDialog }: { subscription: Subscription; onDialog: (dialog: Dialog) => void }) => {
  const { text, locale, price } = useLocale();
  const { busy, error, done, run } = usePlanAction();
  const planName = text.pricing.plans[subscription.planId].name;
  const canceled = Boolean(subscription.canceledAt);
  const renewsAutomatically = subscription.autoRenew && !canceled;
  const endsOn = formatDate(subscription.endsAt, locale);

  return (
    <Card gap={vars.spacing[4]}>
      <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
        <Text as="h3" variant="h3">
          {planName}
        </Text>
        <Badge variant={canceled ? 'neutral' : 'free'}>{canceled ? text.planPage.statuses.canceled : text.planPage.statuses.active}</Badge>
      </Stack>
      <Stack gap={vars.spacing[1]}>
        <Text>
          {canceled
            ? fillText(text.planPage.canceledNote, { date: endsOn })
            : renewsAutomatically
              ? fillText(text.planPage.renewsOn, { date: endsOn, price: price(subscription.total) })
              : fillText(text.planPage.endsOn, { date: endsOn })}
        </Text>
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {[
            text.pricing.durations[`month${subscription.duration}`],
            subscription.members > 1 ? fillText(text.planPage.seats, { count: formatNumber(subscription.members, locale) }) : null,
            fillText(text.planPage.creditAllowance, { total: formatNumber(subscription.credits, locale) }),
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </Stack>

      {!canceled && (
        <Checkbox
          label={text.planPage.autoRenew}
          checked={subscription.autoRenew}
          disabled={busy}
          onChange={(checked) => void run(() => billingApi.setAutoRenew(checked))}
        />
      )}
      {!canceled && !cardPaymentMethods.includes(subscription.paymentMethod) && !subscription.savedMethodId && (
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {text.planPage.autoRenewNeedsCard}
        </Text>
      )}

      <Stack direction="row" wrap gap={vars.spacing[3]}>
        {!canceled && <Button onClick={() => onDialog({ kind: 'change' })}>{text.planPage.changePlan}</Button>}
        {!canceled && subscription.members > 1 && (
          <Button variant="outline" onClick={() => onDialog({ kind: 'seats' })}>
            {text.planPage.changeSeats}
          </Button>
        )}
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void run(billingApi.renew, (account) => fillText(text.planPage.renewed, { date: formatDate(account.subscription?.endsAt ?? '', locale) }))}
        >
          {text.planPage.renewNow}
        </Button>
        {canceled ? (
          <Button variant="secondary" disabled={busy} onClick={() => void run(billingApi.resume, () => text.planPage.resumed)}>
            {text.planPage.resume}
          </Button>
        ) : (
          <Button variant="outline" onClick={() => onDialog({ kind: 'cancel' })}>
            {text.planPage.cancelPlan}
          </Button>
        )}
      </Stack>
      {done && <IconNote icon="check" text={done} />}
      <FieldMessage tone="error" message={error} />
    </Card>
  );
};

// A plan waiting for its Fawry payment: the code to pay, and (in the demo) "Mark as paid".
const PendingPlan = ({ subscription }: { subscription: Subscription }) => {
  const { text } = useLocale();
  const { busy, error, run } = usePlanAction();
  return (
    <Card gap={vars.spacing[3]}>
      <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
        <Text as="h3" variant="h3">
          {text.pricing.plans[subscription.planId].name}
        </Text>
        <Badge variant="neutral">{text.planPage.statuses.pendingPayment}</Badge>
      </Stack>
      <Text variant="label" color={vars.colors.textMuted}>
        {text.checkout.fawryCode}
      </Text>
      <CodeBadge code={subscription.fawryCode} />
      <FieldMessage tone="error" message={error} />
      <div>
        <Button disabled={busy} onClick={() => void run(billingApi.confirmFawryPayment)}>
          {text.checkout.markPaid}
        </Button>
      </div>
    </Card>
  );
};

const CancelDialog = ({ subscription, onClose }: { subscription: Subscription; onClose: () => void }) => {
  const { text, locale } = useLocale();
  const { busy, error, run } = usePlanAction();
  const date = formatDate(subscription.endsAt, locale);
  return (
    <Modal
      open
      onClose={onClose}
      title={text.planPage.cancelTitle}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            {text.planPage.keepPlan}
          </Button>
          <Button variant="danger" disabled={busy} onClick={() => void run(billingApi.cancel).then((ok) => ok && onClose())}>
            {text.planPage.cancelPlan}
          </Button>
        </>
      }
    >
      <Text>{fillText(text.planPage.cancelText, { date })}</Text>
      <FieldMessage tone="error" message={error} />
    </Modal>
  );
};
