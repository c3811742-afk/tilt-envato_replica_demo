import { useState, type FormEvent } from 'react';
import { savePlan } from '@/features/admin/api';
import { FilterBar, Notice } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Plan } from '@/features/admin/types';
import { fillText, hasErrors, isValidAmount, isWholeNumber, localized, toNumber } from '@/features/admin/utils';
import { Button, Checkbox, Modal, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

interface PlanModalProps {
  plan: Plan;
  onClose: () => void;
  onSaved: (plan: Plan) => void;
}

const asField = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));

// A site plan's price, limits and AI credits, and whether it is still sold. Numbers are kept as typed until saved.
export const PlanModal = ({ plan, onClose, onSaved }: PlanModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.plans;
  const [monthlyPrice, setMonthlyPrice] = useState(asField(plan.monthlyPrice));
  const [unlimited, setUnlimited] = useState(plan.downloadLimit === null);
  const [downloadLimit, setDownloadLimit] = useState(asField(plan.downloadLimit));
  const [seats, setSeats] = useState(asField(plan.seats));
  const [aiCredits, setAiCredits] = useState(asField(plan.aiCredits));
  const [parallel, setParallel] = useState(asField(plan.parallelGenerations));
  const [active, setActive] = useState(plan.active);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    // Empty: the plan is sold on request (like Enterprise).
    monthlyPrice: !monthlyPrice.trim() || isValidAmount(monthlyPrice) ? undefined : t.priceInvalid,
    downloadLimit: unlimited || isWholeNumber(downloadLimit, 1) ? undefined : t.wholeNumberMin1,
    seats: !plan.perMember || isWholeNumber(seats, 1) ? undefined : t.wholeNumberMin1,
    aiCredits: isWholeNumber(aiCredits, 0) ? undefined : t.wholeNumber,
    parallel: isWholeNumber(parallel, 1) ? undefined : t.wholeNumberMin1,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;
    const input = {
      monthlyPrice: monthlyPrice.trim() ? (toNumber(monthlyPrice) ?? 0) : null,
      downloadLimit: unlimited ? null : toNumber(downloadLimit),
      seats: toNumber(seats) ?? 1,
      aiCredits: toNumber(aiCredits) ?? 0,
      parallelGenerations: toNumber(parallel) ?? 1,
      active,
    };
    const result = await run(() => savePlan(currentAdmin.id, input, plan.id));
    if (result.ok) onSaved(result.data);
  };

  const shown = (message?: string) => (submitted ? message : undefined);

  return (
    <Modal
      open
      title={fillText(t.editPlanTitle, { name: localized(plan.name, locale) })}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {text.common.saveChanges}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <Notice tone="info">{t.editNote}</Notice>
      <TextField
        type="number"
        label={t.monthlyPriceLabel}
        hint={plan.perMember ? t.monthlyPriceSeatHint : t.monthlyPriceHint}
        value={monthlyPrice}
        onChange={setMonthlyPrice}
        error={shown(errors.monthlyPrice)}
        direction="ltr"
        min="0"
      />
      <Checkbox label={t.unlimitedLabel} checked={unlimited} onChange={setUnlimited} />
      <FilterBar>
        {!unlimited && (
          <TextField
            type="number"
            label={t.downloadLimitLabel}
            value={downloadLimit}
            onChange={setDownloadLimit}
            error={shown(errors.downloadLimit)}
            direction="ltr"
            min="1"
            required
          />
        )}
        {plan.perMember && (
          <TextField
            type="number"
            label={t.seatsLabel}
            hint={t.seatsHint}
            value={seats}
            onChange={setSeats}
            error={shown(errors.seats)}
            direction="ltr"
            min="1"
            required
          />
        )}
      </FilterBar>
      <FilterBar>
        <TextField
          type="number"
          label={t.aiCreditsLabel}
          value={aiCredits}
          onChange={setAiCredits}
          error={shown(errors.aiCredits)}
          direction="ltr"
          min="0"
          required
        />
        <TextField
          type="number"
          label={t.parallelLabel}
          hint={t.parallelHint}
          value={parallel}
          onChange={setParallel}
          error={shown(errors.parallel)}
          direction="ltr"
          min="1"
          required
        />
      </FilterBar>
      <Checkbox label={t.activeLabel} description={t.activeHint} checked={active} onChange={setActive} />
    </Modal>
  );
};
