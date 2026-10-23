import { useState } from 'react';
import { AsyncContent, Button, FieldMessage, IconNote, Modal, SegmentedControl, Select, Stack, Text, stateMessageHeights } from '@/shared/components';
import { planDurations, teamMaxMembers, type PlanDuration } from '@/shared/constants';
import { useAsync, useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Plan, PlanId, Subscription } from '@/shared/types';
import { billingApi, fillText, formatNumber, safeAsync } from '@/shared/utils';

interface ChangePlanDialogProps {
  plans: Plan[]; // plans that can be bought here (Enterprise goes through sales)
  subscription: Subscription;
  initialPlanId?: PlanId;
  seatsOnly?: boolean; // "Change seats": the plan stays, only the seat count changes
  onClose: () => void;
}

// Upgrade, downgrade, change seats or credits mid-period. The new price is shown, with what is paid now
// (or credited) for the rest of the period, and nothing changes until the user confirms it.
export const ChangePlanDialog = ({ plans, subscription, initialPlanId, seatsOnly = false, onClose }: ChangePlanDialogProps) => {
  const { text, locale, price } = useLocale();
  const { setAccount } = useSession();
  const { requestError } = useMessages();
  const [planId, setPlanId] = useState<PlanId>(initialPlanId ?? subscription.planId);
  const [duration, setDuration] = useState<PlanDuration>(subscription.duration);
  const plan = plans.find((candidate) => candidate.id === planId) ?? plans[0];
  const [members, setMembers] = useState(Math.max(subscription.members, plan.minMembers));
  const [credits, setCredits] = useState(plan.creditTiers[0]?.credits);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const seats = plan.perMember ? Math.max(members, plan.minMembers) : 1;
  const request = { planId, duration, members: seats, credits: plan.creditTiers.length ? credits : undefined };
  const quote = useAsync(() => billingApi.quoteChange(request), [planId, duration, seats, credits], () => false);

  const choosePlan = (id: PlanId) => {
    const next = plans.find((candidate) => candidate.id === id);
    if (!next) return;
    setPlanId(id);
    setMembers((current) => Math.max(current, next.minMembers));
    setCredits(next.creditTiers[0]?.credits);
  };

  const confirm = async (net: number) => {
    setSaving(true);
    const result = await safeAsync(() => billingApi.changePlan({ ...request, confirmedNet: net }));
    setSaving(false);
    if (!result.ok) {
      setError(requestError(result.error));
      quote.retry(); // the price may have changed: show the current one
      return;
    }
    setAccount(result.data);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={seatsOnly ? text.planPage.changeSeats : text.planPage.changeTitle}>
      {!seatsOnly && (
        <Select
          label={text.checkout.planTitle}
          value={planId}
          onChange={(value) => choosePlan(value as PlanId)}
          options={plans.map((candidate) => ({ value: candidate.id, label: text.pricing.plans[candidate.id].name }))}
        />
      )}
      {!seatsOnly && (
        <SegmentedControl
          label={text.pricing.durationLabel}
          value={String(duration)}
          onChange={(value) => setDuration(Number(value) as PlanDuration)}
          options={planDurations.map((months) => ({ value: String(months), label: text.pricing.durations[`month${months}`] }))}
        />
      )}
      {plan.perMember && (
        <Select
          label={text.checkout.members}
          value={String(seats)}
          onChange={(value) => setMembers(Number(value))}
          options={Array.from({ length: teamMaxMembers - plan.minMembers + 1 }, (_, index) => {
            const count = plan.minMembers + index;
            return { value: String(count), label: formatNumber(count, locale) };
          })}
        />
      )}
      {!seatsOnly && plan.creditTiers.length > 0 && (
        <Select
          label={text.pricing.creditTierLabel}
          value={String(credits)}
          onChange={(value) => setCredits(Number(value))}
          options={plan.creditTiers.map((tier) => ({
            value: String(tier.credits),
            label: fillText(text.pricing.creditTierOption, { credits: formatNumber(tier.credits, locale) }),
          }))}
        />
      )}

      <AsyncContent state={quote} minHeight={stateMessageHeights.compact}>
        {(data) => {
          const unchanged = planId === subscription.planId && seats === subscription.members && duration === subscription.duration && data.net === 0;
          return (
            <Stack gap={vars.spacing[4]}>
              <Stack gap={vars.spacing[1]}>
                <Text variant="title">{fillText(text.planPage.confirmNew, { price: price(data.newTotal) })}</Text>
                <Text>
                  {data.net > 0
                    ? fillText(text.planPage.confirmCharge, { price: price(data.net) })
                    : data.net < 0
                      ? fillText(text.planPage.confirmCredit, { price: price(-data.net) })
                      : text.planPage.confirmNothing}
                </Text>
              </Stack>
              <IconNote text={text.planPage.prorationNote} />
              <FieldMessage tone="error" message={error} />
              <Stack direction="row" wrap justify="flex-end" gap={vars.spacing[3]}>
                <Button variant="outline" onClick={onClose}>
                  {text.common.cancel}
                </Button>
                <Button disabled={saving || unchanged} onClick={() => void confirm(data.net)}>
                  {saving ? text.common.processing : data.net > 0 ? text.planPage.confirmPay : text.planPage.confirmChange}
                </Button>
              </Stack>
            </Stack>
          );
        }}
      </AsyncContent>
    </Modal>
  );
};
