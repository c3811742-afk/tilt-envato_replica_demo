import { useState, type FormEvent } from 'react';
import { fetchPayoutRules, savePayoutRules } from '@/features/admin/api';
import { FilterBar, Notice, Panel, Stack, TextField } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { PayoutRules } from '@/features/admin/types';
import { fillText, formatMoney, hasErrors, isValidAmount, isWholeNumber, toNumber } from '@/features/admin/utils';
import { AsyncContent, Button, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';

// The last day every month has, so payouts never skip a short month.
const lastPayoutDay = 28;

interface RulesFormProps {
  rules: PayoutRules;
  onSaved: (rules: PayoutRules) => void;
}

const RulesForm = ({ rules, onSaved }: RulesFormProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.payouts.rules;
  const [share, setShare] = useState(String(rules.creatorShare));
  const [minimum, setMinimum] = useState(String(rules.minimumPayout));
  const [day, setDay] = useState(String(rules.payoutDay));
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const errors = {
    share: isWholeNumber(share, 1) && (toNumber(share) ?? 0) <= 100 ? undefined : t.shareInvalid,
    minimum: isValidAmount(minimum) ? undefined : t.minimumInvalid,
    day: isWholeNumber(day, 1) && (toNumber(day) ?? 0) <= lastPayoutDay ? undefined : t.dayInvalid,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setNotice(null);
    if (hasErrors(errors)) return;
    const next = { creatorShare: toNumber(share) ?? 0, minimumPayout: toNumber(minimum) ?? 0, payoutDay: toNumber(day) ?? 1 };
    const result = await run(() => savePayoutRules(currentAdmin.id, next));
    if (!result.ok) return;
    onSaved(result.data);
    setNotice(t.saved);
  };

  const shown = (message?: string) => (submitted ? message : undefined);
  const shareValue = toNumber(share) ?? 0;

  return (
    <form noValidate onSubmit={handleSubmit}>
      <Stack>
        {notice && (
          <Notice tone="success" onDismiss={() => setNotice(null)}>
            {notice}
          </Notice>
        )}
        {error && <Notice tone="danger">{error}</Notice>}
        <Panel title={t.shareTitle}>
          <TextField
            type="number"
            label={t.shareLabel}
            hint={t.shareHint}
            value={share}
            onChange={setShare}
            error={shown(errors.share)}
            min="1"
            max="100"
            required
          />
          {!errors.share && (
            <Text color={vars.colors.textMuted}>
              {fillText(t.example, {
                creator: formatMoney(shareValue, locale),
                tilt: formatMoney(100 - shareValue, locale),
              })}
            </Text>
          )}
        </Panel>
        <Panel title={t.payoutTitle}>
          <FilterBar>
            <TextField
              type="number"
              label={t.minimumLabel}
              hint={t.minimumHint}
              value={minimum}
              onChange={setMinimum}
              error={shown(errors.minimum)}
              min="0"
              required
            />
            <TextField
              type="number"
              label={t.dayLabel}
              hint={fillText(t.dayHint, { max: formatNumber(lastPayoutDay, locale) })}
              value={day}
              onChange={setDay}
              error={shown(errors.day)}
              min="1"
              max={String(lastPayoutDay)}
              required
            />
          </FilterBar>
        </Panel>
        <Stack direction="row">
          <Button type="submit" disabled={pending}>
            {text.admin.common.save}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

// Revenue share and payout threshold. Changes apply from the next payout.
export const RulesTab = () => {
  const { text } = useLocale();
  const rules = useAsync(fetchPayoutRules, []);

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{text.admin.payouts.rules.description}</Text>
      <AsyncContent state={rules}>{(data) => <RulesForm rules={data} onSaved={rules.update} />}</AsyncContent>
    </Stack>
  );
};
