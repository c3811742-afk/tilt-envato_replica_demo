import { useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  ChipGroup,
  EmptyState,
  FieldMessage,
  IconNote,
  Meter,
  OptionCardGroup,
  Page,
  Section,
  SplitLayout,
  Stack,
  Text,
  TextField,
} from '@/shared/components';
import { aiGeneration, aiModelCredits, aiModels, routes, type AiAspectRatio, type AiModelId } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { aiApi, creditAllowance, fillText, formatNumber, generationCost, safeAsync } from '@/shared/utils';
import { GenerationQueue } from '@/features/common/components';

const newestModel = aiModels[aiModels.length - 1];

// "AI images": describe an image, pick a model the plan includes, and generate it with the plan's credits.
// Requests run a few at a time (more on bigger plans); the rest wait in the queue.
export const AiPage = () => {
  const { text, locale } = useLocale();
  const { session, setAccount } = useSession();
  const { requestError } = useMessages();
  const user = session.status === 'signedIn' ? session.user : null;
  const credits = creditAllowance(user?.generations ?? [], session.status === 'signedIn' ? session.subscription : null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<AiModelId>(credits.models[credits.models.length - 1] ?? aiModels[0]);
  const [count, setCount] = useState<number>(aiGeneration.imageCounts[0]);
  const [aspect, setAspect] = useState<AiAspectRatio>(aiGeneration.aspectRatios[0]);
  const [promptError, setPromptError] = useState<string>();
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const cost = generationCost(model, count);

  if (!user || credits.total === 0) {
    return (
      <Page title={text.ai.title} subtitle={text.ai.subtitle}>
        <EmptyState title={text.ai.noAccessTitle} message={text.ai.noAccessText} action={<Button to={routes.pricing}>{text.common.viewPlans}</Button>} />
      </Page>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setPromptError(text.ai.promptRequired);
      return;
    }
    setPromptError(undefined);
    setSending(true);
    const result = await safeAsync(() => aiApi.generate({ prompt, model, count, aspect }));
    setSending(false);
    setError(result.ok ? undefined : requestError(result.error));
    if (result.ok) setAccount(result.data);
  };

  return (
    <Page title={text.ai.title} subtitle={text.ai.subtitle}>
      <SplitLayout
        main={
          <Stack as="form" gap={vars.spacing[5]} onSubmit={submit} noValidate>
            <TextField
              label={text.ai.prompt}
              placeholder={text.ai.promptPlaceholder}
              value={prompt}
              onChange={setPrompt}
              rows={3}
              maxLength={aiGeneration.promptMaxLength}
              error={promptError}
            />
            <OptionCardGroup<AiModelId>
              label={text.ai.model}
              value={model}
              onChange={setModel}
              options={aiModels.map((option) => ({
                value: option,
                title: option === newestModel ? `${text.ai.models[option]} (${text.ai.newest})` : text.ai.models[option],
                description: fillText(text.ai.modelCost, { credits: formatNumber(aiModelCredits[option], locale) }),
                disabled: !credits.models.includes(option),
                disabledReason: text.ai.modelLocked,
              }))}
            />
            <ChipGroup
              label={text.ai.count}
              value={[String(count)]}
              onChange={(value) => value[0] && setCount(Number(value[0]))}
              options={aiGeneration.imageCounts.map((option) => ({ value: String(option), label: formatNumber(option, locale) }))}
            />
            <ChipGroup<AiAspectRatio>
              label={text.ai.aspect}
              value={[aspect]}
              onChange={(value) => value[0] && setAspect(value[0])}
              options={aiGeneration.aspectRatios.map((option) => ({ value: option, label: text.ai.aspects[option] }))}
            />
            <FieldMessage tone="error" message={error} />
            <Stack direction="row" wrap align="center" gap={vars.spacing[3]}>
              <Button type="submit" disabled={sending || cost > credits.remaining}>
                {sending ? text.common.processing : text.ai.generate}
              </Button>
              <Badge variant={cost > credits.remaining ? 'neutral' : 'info'}>{fillText(text.ai.cost, { credits: formatNumber(cost, locale) })}</Badge>
            </Stack>
            {cost > credits.remaining && <Text variant="bodySm">{text.apiErrors.notEnoughCredits}</Text>}
            <IconNote text={text.ai.demoNote} />
          </Stack>
        }
        aside={
          <Card gap={vars.spacing[3]}>
            <Meter
              label={text.planPage.creditsTitle}
              value={credits.used}
              max={credits.total}
              valueText={fillText(text.planPage.creditsUsed, { used: formatNumber(credits.used, locale), total: formatNumber(credits.total, locale) })}
            />
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {fillText(text.planPage.creditsLeft, { count: formatNumber(credits.remaining, locale) })}
            </Text>
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {fillText(text.ai.concurrentNote, { count: formatNumber(credits.concurrent, locale) })}
            </Text>
          </Card>
        }
      />
      <Section title={text.ai.queueTitle} variant="h3">
        <GenerationQueue generations={user.generations} concurrent={credits.concurrent} />
      </Section>
    </Page>
  );
};
