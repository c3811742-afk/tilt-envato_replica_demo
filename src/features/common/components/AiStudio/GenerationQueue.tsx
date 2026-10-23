import { useMemo } from 'react';
import { EmptyState, Stack } from '@/shared/components';
import { useLocale, useNow } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Generation } from '@/shared/types';
import { generationStatus, scheduleGenerations } from '@/shared/utils';
import { AiResult } from './AiResult';

interface GenerationQueueProps {
  generations: Generation[]; // the ones to show, in order
  queue: Generation[]; // everything sharing the plan's slots (the user's, or the whole team's)
  concurrent: number;
  empty?: string; // shown when there are none
}

// AI results with their status: "Queued" while the plan's concurrent slots are busy, "Generating", then "Ready".
export const GenerationQueue = ({ generations, queue, concurrent, empty }: GenerationQueueProps) => {
  const { text } = useLocale();
  const timings = useMemo(() => scheduleGenerations(queue, concurrent), [queue, concurrent]);
  const now = useNow((time) => generations.some((generation) => generationStatus(timings.get(generation.id), time) !== 'done'));

  if (!generations.length) return <EmptyState title={text.ai.queueTitle} message={empty ?? text.ai.queueEmpty} />;

  return (
    <Stack as="ul" gap={vars.spacing[4]}>
      {generations.map((generation) => (
        <AiResult key={generation.id} generation={generation} status={generationStatus(timings.get(generation.id), now)} />
      ))}
    </Stack>
  );
};
