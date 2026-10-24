import { useState } from 'react';
import { Button, EmptyState, Page, Select, Stack, Text, TextField } from '@/shared/components';
import { aiShortcuts, aiTools, routes, type AiOperation } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { accountCredits, matchesText, planUsage, operationName } from '@/shared/utils';
import { GenerationQueue } from '@/features/common/components';

type HistorySort = 'newest' | 'oldest';
const sorts: HistorySort[] = ['newest', 'oldest'];
const allTools = '';

// "Generation history": everything the user generated, filtered by tool, sorted, and searched by prompt.
export const AiHistoryPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const [query, setQuery] = useState('');
  const [tool, setTool] = useState<AiOperation | typeof allTools>(allTools);
  const [sort, setSort] = useState<HistorySort>('newest');
  if (session.status !== 'signedIn') return null; // only signed-in users reach this page

  const mine = session.user.generations;
  const shown = mine
    .filter((generation) => (!tool || generation.tool === tool) && matchesText(query, generation.prompt, generation.sourceName))
    .sort((a, b) => (sort === 'newest' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));
  const usedTools = [...aiTools, ...aiShortcuts].filter((operation) => mine.some((generation) => generation.tool === operation));

  return (
    <Page title={text.ai.historyTitle} subtitle={text.ai.historySubtitle} gap={vars.spacing[6]}>
      {mine.length === 0 ? (
        <EmptyState title={text.ai.historyTitle} message={text.ai.historyEmpty} action={<Button to={routes.ai}>{text.ai.title}</Button>} />
      ) : (
        <>
          <Stack direction="row" wrap align="flex-end" gap={vars.spacing[3]}>
            <Stack grow>
              <TextField label={text.ai.historySearch} value={query} onChange={setQuery} />
            </Stack>
            <Select
              label={text.ai.historyType}
              value={tool}
              onChange={(value) => setTool(value as AiOperation)}
              options={[{ value: allTools, label: text.ai.allTools }, ...usedTools.map((operation) => ({ value: operation, label: operationName(text, operation) }))]}
            />
            <Select label={text.ai.sort} value={sort} onChange={(value) => setSort(value as HistorySort)} options={sorts.map((option) => ({ value: option, label: text.ai.sorts[option] }))} />
          </Stack>
          {shown.length === 0 ? (
            <Text color={vars.colors.textMuted}>{text.ai.historyNoMatch}</Text>
          ) : (
            <GenerationQueue generations={shown} queue={planUsage(session).generations} concurrent={accountCredits(session).concurrent} />
          )}
        </>
      )}
    </Page>
  );
};
