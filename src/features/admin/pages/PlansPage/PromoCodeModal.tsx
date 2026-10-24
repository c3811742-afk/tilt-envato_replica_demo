import { useState, type FormEvent } from 'react';
import { adminErrorCode, createPromoCode } from '@/features/admin/api';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Plan, PromoCode } from '@/features/admin/types';
import {
  hasErrors,
  isWholeNumber,
  localized,
  toDateKey,
  toggleItem,
  toNumber,
} from '@/features/admin/utils';
import { Checkbox, FieldGroup, FilterBar, Modal, ModalActions, Notice, Stack, TextField } from '@/shared/components';
import type { PlanId } from '@/shared/types';
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
  const { run, busy: pending, error, clearError } = useAdminAction();
  const t = text.admin.promoCodes;
  const [code, setCode] = useState('');
  const [value, setValue] = useState('');
  const [allPlans, setAllPlans] = useState(true);
  const [planIds, setPlanIds] = useState<PlanId[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [codeTaken, setCodeTaken] = useState(false);
  const today = toDateKey();

  const errors = {
    code: codeTaken ? text.admin.errors.codeTaken : codePattern.test(code.trim().toUpperCase()) ? undefined : t.codeInvalid,
    value: isWholeNumber(value, 1) && (toNumber(value) ?? 0) <= 100 ? undefined : t.percentInvalid,
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
      percent: toNumber(value) ?? 0,
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
        <ModalActions confirmLabel={t.add} onCancel={onClose} submit busy={pending} />
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
      <TextField
        type="number"
        label={t.percentLabel}
        value={value}
        onChange={setValue}
        error={shown(errors.value)}
        direction="ltr"
        min="1"
        max="100"
        required
      />
      <FieldGroup label={t.plansLabel} error={shown(errors.plans)}>
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
      </FieldGroup>
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
