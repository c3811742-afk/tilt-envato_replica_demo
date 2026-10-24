import { useState, type FormEvent } from 'react';
import { adminErrorCode, createPromoCode } from '@/features/admin/api';
import { Checkbox, Field, FilterBar, Modal, Notice, SelectField, Stack, TextField } from '@/features/admin/components';
import { discountTypes } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { DiscountType, Plan, PromoCode } from '@/features/admin/types';
import {
  hasErrors,
  isOneOf,
  isValidAmount,
  isWholeNumber,
  localized,
  toDateKey,
  toggleItem,
  toNumber,
} from '@/features/admin/utils';
import { Button } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

// Letters and numbers only, so the code is easy to read out and type: RAMADAN30.
const codePattern = /^[A-Z0-9]{4,20}$/;

interface PromoCodeModalProps {
  plans: Plan[];
  onClose: () => void;
  onCreated: (promo: PromoCode) => void;
}

export const PromoCodeModal = ({ plans, onClose, onCreated }: PromoCodeModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error, clearError } = useAdminAction();
  const t = text.admin.promoCodes;
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [value, setValue] = useState('');
  const [allPlans, setAllPlans] = useState(true);
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [codeTaken, setCodeTaken] = useState(false);
  const today = toDateKey();

  const errors = {
    code: codeTaken ? text.admin.errors.codeTaken : codePattern.test(code.trim().toUpperCase()) ? undefined : t.codeInvalid,
    value:
      discountType === 'percent'
        ? isWholeNumber(value, 1) && (toNumber(value) ?? 0) <= 100
          ? undefined
          : t.percentInvalid
        : isValidAmount(value)
          ? undefined
          : t.amountInvalid,
    plans: allPlans || planIds.length > 0 ? undefined : t.plansRequired,
    expiresAt: !expiresAt ? text.admin.common.dateRequired : expiresAt < today ? t.expiryPast : undefined,
    maxUses: !maxUses.trim() || isWholeNumber(maxUses, 1) ? undefined : t.maxUsesInvalid,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;
    const input = {
      code,
      discountType,
      value: toNumber(value) ?? 0,
      planIds: allPlans ? [] : planIds,
      expiresAt,
      maxUses: maxUses.trim() ? toNumber(maxUses) : null,
    };
    const result = await run(() => createPromoCode(currentAdmin.id, input));
    if (result.ok) {
      onCreated(result.data);
      return;
    }
    // A taken code belongs to the code field; anything else is shown above the form.
    if (adminErrorCode(result.error) === 'codeTaken') {
      clearError();
      setCodeTaken(true);
    }
  };

  const shown = (message?: string) => (submitted ? message : undefined);

  return (
    <Modal
      open
      title={t.add}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {t.add}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <TextField
        label={t.codeLabel}
        hint={t.codeHint}
        value={code}
        onChange={(next) => {
          setCode(next.toUpperCase());
          setCodeTaken(false);
        }}
        error={shown(errors.code)}
        direction="ltr"
        required
      />
      <FilterBar>
        <SelectField
          label={t.discountTypeLabel}
          options={discountTypes.map((option) => ({ value: option, label: t.discountTypes[option] }))}
          value={discountType}
          onChange={(next) => isOneOf(discountTypes, next) && setDiscountType(next)}
        />
        <TextField
          type="number"
          label={discountType === 'percent' ? t.percentLabel : t.amountLabel}
          value={value}
          onChange={setValue}
          error={shown(errors.value)}
          min="0"
          required
        />
      </FilterBar>
      <Field group label={t.plansLabel} error={shown(errors.plans)}>
        <Stack gap={vars.spacing[3]}>
          <Checkbox label={t.allPlans} checked={allPlans} onChange={setAllPlans} />
          {!allPlans &&
            plans.map((plan) => (
              <Checkbox
                key={plan.id}
                label={localized(plan.name, locale)}
                checked={planIds.includes(plan.id)}
                onChange={() => setPlanIds((current) => toggleItem(current, plan.id))}
              />
            ))}
        </Stack>
      </Field>
      <FilterBar>
        <TextField
          type="date"
          label={t.expiresLabel}
          hint={t.expiresHint}
          value={expiresAt}
          min={today}
          onChange={setExpiresAt}
          error={shown(errors.expiresAt)}
          required
        />
        <TextField
          type="number"
          label={t.maxUsesLabel}
          hint={t.maxUsesHint}
          value={maxUses}
          onChange={setMaxUses}
          error={shown(errors.maxUses)}
          min="1"
        />
      </FilterBar>
    </Modal>
  );
};
