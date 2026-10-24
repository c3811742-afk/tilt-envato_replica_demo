import { useState, type FormEvent } from 'react';
import { fetchGenerationCosts, saveGenerationCosts } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { GenerationCost, GenerationType } from '@/features/admin/types';
import { isWholeNumber, toNumber } from '@/features/admin/utils';
import { AsyncContent, Button, Card, Stack, Text, TextField } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import styles from './AiPage.module.css';

interface CostsFormProps {
  initialCosts: GenerationCost[];
}

const CostsForm = ({ initialCosts }: CostsFormProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.ai;
  const [values, setValues] = useState<Record<GenerationType, string>>(
    () => Object.fromEntries(initialCosts.map((cost) => [cost.type, String(cost.credits)])) as Record<GenerationType, string>,
  );
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const invalid = (type: GenerationType) => !isWholeNumber(values[type], 1);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setNotice(null);
    if (initialCosts.some((cost) => invalid(cost.type))) return;
    const costs = initialCosts.map((cost) => ({ type: cost.type, credits: toNumber(values[cost.type]) ?? cost.credits }));
    const result = await run(() => saveGenerationCosts(currentAdmin.id, costs));
    if (result.ok) setNotice(t.costsSaved);
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <Stack>
        {notice && (
          <Notice tone="success" onDismiss={() => setNotice(null)}>
            {notice}
          </Notice>
        )}
        {error && <Notice tone="danger">{error}</Notice>}
        <Card>
          <div className={styles.costs}>
            {initialCosts.map((cost) => (
              <TextField
                key={cost.type}
                type="number"
                label={t.generationTypes[cost.type]}
                hint={t.creditsHint}
                value={values[cost.type]}
                onChange={(value) => setValues((current) => ({ ...current, [cost.type]: value }))}
                error={submitted && invalid(cost.type) ? t.creditsInvalid : undefined}
                min="1"
                required
              />
            ))}
          </div>
        </Card>
        <Stack direction="row" wrap>
          <Button type="submit" disabled={pending}>
            {text.common.saveChanges}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

// How many AI credits each kind of generation uses. Plans include a number of credits each month.
export const CostsTab = () => {
  const { text } = useLocale();
  const costs = useAsync(fetchGenerationCosts, []);

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{text.admin.ai.costsDescription}</Text>
      <AsyncContent state={costs}>{(data) => <CostsForm initialCosts={data} />}</AsyncContent>
    </Stack>
  );
};
