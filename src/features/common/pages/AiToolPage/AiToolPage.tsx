import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Button, Card, EmptyState, Meter, Page, Section, SplitLayout, Stack, Text, TextLink } from '@/shared/components';
import { aiShortcuts, aiSourceParam, aiTools, routes, withReturnTo, type AiOperation } from '@/shared/constants';
import { useLocale, useSession, useStoredValue } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Session } from '@/shared/types';
import {
  accountCredits,
  aiSettingsStore,
  aiToolAccess,
  fillText,
  formatCount,
  formatNumber,
  operationName,
  planUsage,
} from '@/shared/utils';
import { findOutput, GenerationQueue } from '@/features/common/components';
import { AudioForm, EditForm, ImageForm, MockupForm, VideoForm } from './ToolForms';
import type { ImageSource } from './imageSource';

const isOperation = (value: string | undefined): value is AiOperation =>
  value !== undefined && ([...aiTools, ...aiShortcuts] as readonly string[]).includes(value);

// One AI tool. Everyone sees what it does; subscribers get the form, what it costs, and their results from it.
export const AiToolPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const { tool } = useParams();
  useStoredValue(aiSettingsStore); // follows the team's AI settings in the admin as they change

  if (!isOperation(tool)) {
    return (
      <Page>
        <EmptyState title={text.notFound.title} message={text.notFound.message} action={<Button to={routes.ai}>{text.ai.title}</Button>} />
      </Page>
    );
  }

  const description = tool in text.ai.tools ? text.ai.tools[tool as keyof typeof text.ai.tools].description : text.ai.shortcutsTitle;
  const credits = session.status === 'signedIn' ? accountCredits(session) : null;
  // The team's settings: a tool can be off for everyone, or not included in this plan.
  const access = (aiTools as readonly string[]).includes(tool)
    ? aiToolAccess(tool as (typeof aiTools)[number], session.status === 'signedIn' ? (session.subscription?.planId ?? null) : null)
    : 'included';

  return (
    <Page title={operationName(text, tool)} subtitle={description} gap={vars.spacing[7]} backTo={routes.ai} backLabel={text.ai.title}>
      {access === 'off' ? (
        <EmptyState title={text.ai.toolOffTitle} message={text.apiErrors.aiToolOff} action={<Button to={routes.ai}>{text.ai.title}</Button>} />
      ) : session.status !== 'signedIn' ? (
        <EmptyState
          title={text.ai.noAccessTitle}
          message={text.ai.signInText}
          action={<Button to={withReturnTo(routes.signIn, routes.aiTool.replace(':tool', tool))}>{text.common.signIn}</Button>}
        />
      ) : !credits?.total ? (
        <EmptyState title={text.ai.noAccessTitle} message={text.ai.noAccessText} action={<Button to={routes.pricing}>{text.common.viewPlans}</Button>} />
      ) : access === 'notInPlan' ? (
        <EmptyState title={text.ai.notInPlan} message={text.apiErrors.aiToolNotInPlan} action={<Button to={routes.pricing}>{text.common.viewPlans}</Button>} />
      ) : (
        <ToolWorkspace key={tool} tool={tool} session={session} />
      )}
    </Page>
  );
};

const ToolWorkspace = ({ tool, session }: { tool: AiOperation; session: Extract<Session, { status: 'signedIn' }> }) => {
  const { text, locale } = useLocale();
  const [params] = useSearchParams();
  const credits = accountCredits(session);
  const { generations } = planUsage(session);
  const mine = session.user.generations;
  // "Use in" on a result opens a tool with that image ready to work on.
  const linked = findOutput(mine, params.get(aiSourceParam));
  const [source, setSource] = useState<ImageSource | null>(linked ? { kind: 'result', ...linked } : null);

  const form = (() => {
    switch (tool) {
      case 'image':
      case 'graphics':
        return <ImageForm tool={tool} allowance={credits} />;
      case 'mockup':
        return <MockupForm source={source} onSource={setSource} />;
      case 'video':
      case 'cameraMotion':
        return <VideoForm tool={tool} allowance={credits} source={source} onSource={setSource} />;
      case 'music':
      case 'voice':
      case 'soundEffect':
        return <AudioForm tool={tool} />;
      default:
        return <EditForm tool={tool} source={source} onSource={setSource} />;
    }
  })();

  return (
    <Stack gap={vars.spacing[7]}>
      <SplitLayout
        main={form}
        aside={
          <Card gap={vars.spacing[3]}>
            {/* What's left, large: it changes with every generation, while the bar barely moves on a big allowance. */}
            <Text as="p" variant="h3">
              {formatCount(text.ai.creditsLeft, credits.remaining, locale)}
            </Text>
            <Meter
              label={text.planPage.creditsTitle}
              value={credits.used}
              max={credits.total}
              valueText={fillText(text.planPage.creditsUsed, { used: formatNumber(credits.used, locale), total: formatNumber(credits.total, locale) })}
            />
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {formatCount(text.ai.concurrentNote, credits.concurrent, locale)}
            </Text>
            <TextLink to={routes.aiHistory} variant="bodySm">
              {text.ai.history}
            </TextLink>
          </Card>
        }
      />
      <Section title={text.ai.queueTitle} variant="h3">
        <GenerationQueue generations={mine.filter((generation) => generation.tool === tool)} queue={generations} concurrent={credits.concurrent} />
      </Section>
    </Stack>
  );
};
