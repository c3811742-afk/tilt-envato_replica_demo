import { useState } from 'react';
import { Button, Card, DetailList, Meter, Modal, Stack, Table, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Session } from '@/shared/types';
import {
  accountAllowance,
  accountCredits,
  fillText,
  formatCount,
  formatDate,
  formatNumber,
  operationName,
  planUsage,
} from '@/shared/utils';

type SignedIn = Extract<Session, { status: 'signedIn' }>;

// Downloads and AI credits left this month (the whole team's on a team plan), as meters, with the credit details one click away.
export const UsageMeters = ({ session }: { session: SignedIn }) => {
  const { text, locale } = useLocale();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const downloads = accountAllowance(session);
  const credits = accountCredits(session);
  const count = (value: number) => formatNumber(value, locale);

  return (
    <Card gap={vars.spacing[5]}>
      {downloads.source && (
        <Stack gap={vars.spacing[2]}>
          {downloads.limit === null ? (
            <Meter label={text.planPage.downloadsTitle} value={1} max={1} valueText={fillText(text.planPage.downloadsUnlimited, { used: count(downloads.used) })} />
          ) : (
            <Meter
              label={downloads.source === 'pass' ? text.planPage.passTitle : text.planPage.downloadsTitle}
              value={downloads.used}
              max={downloads.limit}
              valueText={fillText(text.planPage.downloadsUsed, { used: count(downloads.used), limit: count(downloads.limit) })}
            />
          )}
          {downloads.resetsAt && (
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {fillText(text.planPage.resetsOn, { date: formatDate(downloads.resetsAt, locale) })}
            </Text>
          )}
        </Stack>
      )}

      {credits.total > 0 && (
        <Stack gap={vars.spacing[2]}>
          <Meter
            label={text.planPage.creditsTitle}
            value={credits.used}
            max={credits.total}
            valueText={fillText(text.planPage.creditsUsed, { used: count(credits.used), total: count(credits.total) })}
          />
          <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {formatCount(text.planPage.creditsLeft, credits.remaining, locale)}
            </Text>
            <Button variant="outline" size="sm" onClick={() => setDetailsOpen(true)}>
              {text.planPage.creditDetails}
            </Button>
          </Stack>
        </Stack>
      )}

      {detailsOpen && <CreditDetailsDialog session={session} onClose={() => setDetailsOpen(false)} />}
    </Card>
  );
};

// What the plan gives (credits a month, generations at once, models), and what was spent this month.
const CreditDetailsDialog = ({ session, onClose }: { session: SignedIn; onClose: () => void }) => {
  const { text, locale } = useLocale();
  const credits = accountCredits(session);
  const since = credits.resetsAt ? new Date(credits.resetsAt) : null;
  if (since) since.setMonth(since.getMonth() - 1);
  const thisMonth = planUsage(session).generations.filter((generation) => !since || new Date(generation.createdAt) >= since);

  return (
    <Modal open onClose={onClose} title={text.planPage.creditDetailsTitle} width={vars.sizes.modal.wideWidth}>
      <DetailList
        rows={[
          { label: text.planPage.creditsTitle, value: fillText(text.planPage.creditAllowance, { total: formatNumber(credits.total, locale) }) },
          { label: text.pricing.compare.concurrent, value: formatCount(text.planPage.concurrent, credits.concurrent, locale) },
          { label: text.pricing.compare.models, value: credits.models.map((model) => text.ai.models[model]).join(', ') },
        ]}
      />
      {credits.resetsAt && (
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {fillText(text.planPage.resetsOn, { date: formatDate(credits.resetsAt, locale) })}
        </Text>
      )}
      <Text as="h3" variant="h4">
        {text.planPage.creditHistory}
      </Text>
      <Table
        label={text.planPage.creditHistory}
        columns={[
          { key: 'date', label: text.invoice.date },
          { key: 'prompt', label: text.ai.prompt },
          { key: 'model', label: text.ai.historyType },
          { key: 'credits', label: text.planPage.creditsTitle, align: 'end' },
        ]}
        rows={thisMonth.map((generation) => ({
          key: generation.id,
          cells: {
            date: formatDate(generation.createdAt, locale),
            prompt: (
              <Text as="span" variant="bodySm" autoDirection maxLines={2}>
                {generation.prompt}
              </Text>
            ),
            model: operationName(text, generation.tool),
            credits: fillText(text.planPage.creditsSpent, { credits: formatNumber(generation.credits, locale) }),
          },
        }))}
        emptyText={text.planPage.creditsNone}
      />
    </Modal>
  );
};
