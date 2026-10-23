import { useMemo } from 'react';
import { Badge, Card, EmptyState, Grid, Stack, Text } from '@/shared/components';
import { useLocale, useNow } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Generation } from '@/shared/types';
import { fillText, formatDate, formatNumber, generatedImage, generationStatus, scheduleGenerations } from '@/shared/utils';
import styles from './GenerationQueue.module.css';

const dateTimeFormat: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };
const statusBadges = { queued: 'neutral', running: 'highlight', done: 'free' } as const;

// The user's AI generations, newest first: "Queued" while the plan's concurrent slots are busy,
// "Generating", then "Ready" with the images. Shown on the AI page and in Notifications.
export const GenerationQueue = ({ generations, concurrent }: { generations: Generation[]; concurrent: number }) => {
  const { text, locale } = useLocale();
  const timings = useMemo(() => scheduleGenerations(generations, concurrent), [generations, concurrent]);
  const now = useNow((time) => generations.some((generation) => generationStatus(timings.get(generation.id), time) !== 'done'));

  if (!generations.length) return <EmptyState title={text.ai.queueTitle} message={text.ai.queueEmpty} />;

  return (
    <Stack as="ul" gap={vars.spacing[3]}>
      {generations.map((generation) => {
        const status = generationStatus(timings.get(generation.id), now);
        return (
          <Card key={generation.id} as="li" gap={vars.spacing[3]}>
            <Stack direction="row" wrap align="flex-start" justify="space-between" gap={vars.spacing[2]}>
              <Stack gap={vars.spacing[1]}>
                <Text variant="title" autoDirection maxLines={2}>
                  {generation.prompt}
                </Text>
                <Text variant="bodySm" color={vars.colors.textMuted}>
                  {[
                    text.ai.models[generation.model],
                    fillText(text.ai.cost, { credits: formatNumber(generation.credits, locale) }),
                    formatDate(generation.createdAt, locale, dateTimeFormat),
                  ].join(' · ')}
                </Text>
              </Stack>
              <Badge variant={statusBadges[status]}>{text.ai.statuses[status]}</Badge>
            </Stack>
            {status === 'done' && (
              <Grid minColumnWidth={vars.sizes.itemCard.minWidth.small} gap={vars.spacing[2]} ariaLabel={generation.prompt}>
                {Array.from({ length: generation.count }, (_, index) => (
                  <li key={index}>
                    <img
                      className={styles.image}
                      src={generatedImage(generation.prompt, generation.seed, index, generation.aspect)}
                      alt={fillText(text.ai.imageLabel, { number: formatNumber(index + 1, locale), prompt: generation.prompt })}
                    />
                  </li>
                ))}
              </Grid>
            )}
          </Card>
        );
      })}
    </Stack>
  );
};
