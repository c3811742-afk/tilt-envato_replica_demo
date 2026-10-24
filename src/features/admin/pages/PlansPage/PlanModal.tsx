import { useState, type FormEvent } from 'react';
import { savePlan } from '@/features/admin/api';
import { Checkbox, FilterBar, LocalizedField, Modal, Notice, SelectField, TextField } from '@/features/admin/components';
import { licenseScopes } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { LicenseScope, Plan } from '@/features/admin/types';
import {
  emptyLocalized,
  hasErrors,
  isOneOf,
  isValidAmount,
  isWholeNumber,
  localizedErrors,
  toNumber,
} from '@/features/admin/utils';
import { Button } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

interface PlanModalProps {
  plan?: Plan; // editing; adding when missing
  onClose: () => void;
  onSaved: (plan: Plan) => void;
}

const asField = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));

// Prices, limits, license scope and the AI credits a plan includes. Numbers are kept as typed until saved.
export const PlanModal = ({ plan, onClose, onSaved }: PlanModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.plans;
  const [name, setName] = useState(plan?.name ?? emptyLocalized());
  const [monthlyPrice, setMonthlyPrice] = useState(asField(plan?.monthlyPrice));
  const [yearlyPrice, setYearlyPrice] = useState(asField(plan?.yearlyPrice));
  const [unlimited, setUnlimited] = useState(plan ? plan.downloadLimit === null : false);
  const [downloadLimit, setDownloadLimit] = useState(asField(plan?.downloadLimit));
  const [seats, setSeats] = useState(asField(plan?.seats ?? 1));
  const [licenseScope, setLicenseScope] = useState<LicenseScope>(plan?.licenseScope ?? 'personal');
  const [aiCredits, setAiCredits] = useState(asField(plan?.aiCredits ?? 0));
  const [parallel, setParallel] = useState(asField(plan?.parallelGenerations ?? 1));
  const [active, setActive] = useState(plan?.active ?? true);
  const [submitted, setSubmitted] = useState(false);

  const nameErrors = localizedErrors(name, text);
  const errors = {
    monthlyPrice: isValidAmount(monthlyPrice) ? undefined : t.priceInvalid,
    yearlyPrice: isValidAmount(yearlyPrice) ? undefined : t.priceInvalid,
    downloadLimit: unlimited || isWholeNumber(downloadLimit, 1) ? undefined : t.wholeNumberMin1,
    seats: isWholeNumber(seats, 1) ? undefined : t.wholeNumberMin1,
    aiCredits: isWholeNumber(aiCredits, 0) ? undefined : t.wholeNumber,
    parallel: isWholeNumber(parallel, 1) ? undefined : t.wholeNumberMin1,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(nameErrors) || hasErrors(errors)) return;
    const input = {
      name,
      monthlyPrice: toNumber(monthlyPrice) ?? 0,
      yearlyPrice: toNumber(yearlyPrice) ?? 0,
      downloadLimit: unlimited ? null : toNumber(downloadLimit),
      seats: toNumber(seats) ?? 1,
      licenseScope,
      aiCredits: toNumber(aiCredits) ?? 0,
      parallelGenerations: toNumber(parallel) ?? 1,
      active,
    };
    const result = await run(() => savePlan(currentAdmin.id, input, plan?.id));
    if (result.ok) onSaved(result.data);
  };

  const shown = (message?: string) => (submitted ? message : undefined);

  return (
    <Modal
      open
      title={plan ? t.editTitle : t.add}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {plan ? text.admin.common.save : t.add}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      {plan && <Notice tone="info">{t.editNote}</Notice>}
      <LocalizedField label={t.nameLabel} value={name} onChange={setName} errors={submitted ? nameErrors : {}} required />
      <FilterBar>
        <TextField
          type="number"
          label={t.monthlyPriceLabel}
          value={monthlyPrice}
          onChange={setMonthlyPrice}
          error={shown(errors.monthlyPrice)}
          min="0"
          required
        />
        <TextField
          type="number"
          label={t.yearlyPriceLabel}
          value={yearlyPrice}
          onChange={setYearlyPrice}
          error={shown(errors.yearlyPrice)}
          min="0"
          required
        />
      </FilterBar>
      <Checkbox label={t.unlimitedLabel} checked={unlimited} onChange={setUnlimited} />
      <FilterBar>
        {!unlimited && (
          <TextField
            type="number"
            label={t.downloadLimitLabel}
            value={downloadLimit}
            onChange={setDownloadLimit}
            error={shown(errors.downloadLimit)}
            min="1"
            required
          />
        )}
        <TextField
          type="number"
          label={t.seatsLabel}
          value={seats}
          onChange={setSeats}
          error={shown(errors.seats)}
          min="1"
          required
        />
      </FilterBar>
      <SelectField
        label={t.licenseScopeLabel}
        hint={t.licenseScopeHint}
        options={licenseScopes.map((value) => ({ value, label: text.admin.licenseScopes[value] }))}
        value={licenseScope}
        onChange={(value) => isOneOf(licenseScopes, value) && setLicenseScope(value)}
      />
      <FilterBar>
        <TextField
          type="number"
          label={t.aiCreditsLabel}
          value={aiCredits}
          onChange={setAiCredits}
          error={shown(errors.aiCredits)}
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
          min="1"
          required
        />
      </FilterBar>
      <Checkbox label={t.activeLabel} description={t.activeHint} checked={active} onChange={setActive} />
    </Modal>
  );
};
