import { useState } from 'react';
import { AsyncContent, Badge, Button, Card, FieldMessage, Grid, Icon, IconNote, Section, Stack, Table, Text } from '@/shared/components';
import { studioEarnings } from '@/shared/constants';
import { useAction, useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { downloadTextFile, fillText, formatDate, formatNumber, studioApi } from '@/shared/utils';
import { CreatorArea, elementTitle } from '@/features/creator/components';

const monthFormat: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

// "Earnings": the pending and available balance, a payout request from the minimum, earnings per element and
// per month, past payouts, and a statement to download.
export const CreatorEarningsPage = () => {
  const { text, locale, price } = useLocale();
  const earnings = useAsync(studioApi.earnings, [], () => false);
  const { run, busy, error } = useAction();
  const [requested, setRequested] = useState<number | null>(null);
  const t = text.studio;

  const requestPayout = async () => {
    const result = await run(studioApi.requestPayout);
    if (!result.ok) return;
    setRequested(result.data.amount);
    earnings.retry();
  };

  return (
    <CreatorArea section="earnings" title={t.earningsTitle} subtitle={fillText(t.earningsSubtitle, { amount: price(studioEarnings.perDownload) })}>
      <AsyncContent state={earnings}>
        {({ balance, perElement, perMonth, payouts }) => {
          // A plain-text statement: balances, earnings per month and per element, and payouts.
          const statement = () =>
            [
              `${t.earningsTitle} · ${formatDate(new Date().toISOString(), locale)}`,
              '',
              `${t.balance.total}: ${price(balance.total)}`,
              `${t.balance.pending}: ${price(balance.pending)}`,
              `${t.balance.available}: ${price(balance.available)}`,
              `${t.balance.paidOut}: ${price(balance.paidOut)}`,
              '',
              t.perPeriodTitle,
              ...perMonth.map((row) => `${formatDate(row.month, locale, monthFormat)}: ${formatNumber(row.downloads, locale)} · ${price(row.earnings)}`),
              '',
              t.perItemTitle,
              ...perElement.map((row) => `${elementTitle(row.element, t.untitled)}: ${formatNumber(row.downloads, locale)} · ${price(row.earnings)}`),
              '',
              t.payoutsTitle,
              ...payouts.map((payout) => `${formatDate(payout.requestedAt, locale)}: ${price(payout.amount)} · ${t.payoutStatuses[payout.status]}`),
            ].join('\n');

          return (
            <Stack gap={vars.spacing[6]}>
              <Grid minColumnWidth={vars.sizes.itemCard.minWidth.small} gap={vars.spacing[4]} ariaLabel={t.earningsTitle}>
                {(['available', 'pending', 'total', 'paidOut'] as const).map((key) => (
                  <Card key={key} as="li" gap={vars.spacing[1]}>
                    <Text variant="label" color={vars.colors.textMuted}>
                      {t.balance[key]}
                    </Text>
                    <Text variant="h2">{price(balance[key])}</Text>
                  </Card>
                ))}
              </Grid>
              <Text variant="bodySm" color={vars.colors.textMuted}>
                {fillText(t.pendingNote, { days: formatNumber(studioEarnings.pendingDays, locale) })}
              </Text>
              <Stack direction="row" wrap align="center" gap={vars.spacing[3]}>
                <Button disabled={busy || !balance.canRequest} onClick={() => void requestPayout()}>
                  {t.requestPayout}
                </Button>
                <Button variant="outline" onClick={() => downloadTextFile(`${t.statementFile}.txt`, statement())}>
                  <Icon name="download" size={vars.sizes.icon.sm} />
                  {t.downloadStatement}
                </Button>
              </Stack>
              {requested !== null && <IconNote icon="check" text={fillText(t.payoutRequested, { amount: price(requested) })} />}
              {!balance.canRequest && <IconNote text={fillText(t.payoutMinimum, { amount: price(studioEarnings.payoutMinimum) })} />}
              <FieldMessage tone="error" message={error} />

              <Section title={t.perItemTitle} variant="h3" gap={vars.spacing[3]}>
                <Table
                  label={t.perItemTitle}
                  columns={[
                    { key: 'element', label: t.columns.element },
                    { key: 'downloads', label: t.columns.downloads, align: 'end' },
                    { key: 'earnings', label: t.columns.earnings, align: 'end' },
                  ]}
                  rows={perElement.map((row) => ({
                    key: row.element.id,
                    cells: {
                      element: <bdi>{elementTitle(row.element, t.untitled)}</bdi>,
                      downloads: formatNumber(row.downloads, locale),
                      earnings: price(row.earnings),
                    },
                  }))}
                  emptyText={t.noEarnings}
                />
              </Section>

              <Section title={t.perPeriodTitle} variant="h3" gap={vars.spacing[3]}>
                <Table
                  label={t.perPeriodTitle}
                  columns={[
                    { key: 'month', label: t.columns.month },
                    { key: 'downloads', label: t.columns.downloads, align: 'end' },
                    { key: 'earnings', label: t.columns.earnings, align: 'end' },
                  ]}
                  rows={perMonth.map((row) => ({
                    key: row.month,
                    cells: { month: formatDate(row.month, locale, monthFormat), downloads: formatNumber(row.downloads, locale), earnings: price(row.earnings) },
                  }))}
                />
              </Section>

              <Section title={t.payoutsTitle} variant="h3" gap={vars.spacing[3]}>
                <Table
                  label={t.payoutsTitle}
                  columns={[
                    { key: 'date', label: t.columns.date },
                    { key: 'amount', label: t.columns.amount, align: 'end' },
                    { key: 'status', label: t.columns.status },
                  ]}
                  rows={payouts.map((payout) => ({
                    key: payout.id,
                    cells: {
                      date: formatDate(payout.paidAt ?? payout.requestedAt, locale),
                      amount: price(payout.amount),
                      status: <Badge variant={payout.status === 'paid' ? 'free' : 'info'}>{t.payoutStatuses[payout.status]}</Badge>,
                    },
                  }))}
                  emptyText={t.payoutsEmpty}
                />
              </Section>
            </Stack>
          );
        }}
      </AsyncContent>
    </CreatorArea>
  );
};
