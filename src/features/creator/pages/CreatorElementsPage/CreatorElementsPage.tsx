import { useState } from 'react';
import { AsyncContent, Button, ChipGroup, EmptyState, Stack, Table, Text, TextField, TextLink } from '@/shared/components';
import { creatorElementPath, routes, studioStatuses, type StudioStatus } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, matchesText, studioApi } from '@/shared/utils';
import { CreatorArea, elementTitle, StudioStatusBadge } from '@/features/creator/components';

const allStatuses = 'all';

// "My elements": every element the creator uploaded, filtered by review status and searched by title or tag.
export const CreatorElementsPage = () => {
  const { text, locale } = useLocale();
  const elements = useAsync(studioApi.myElements, []);
  const [status, setStatus] = useState<StudioStatus | typeof allStatuses>(allStatuses);
  const [query, setQuery] = useState('');

  return (
    <CreatorArea section="elements" title={text.studio.elementsTitle} subtitle={text.studio.elementsSubtitle}>
      <AsyncContent
        state={elements}
        empty={<EmptyState title={text.studio.elementsTitle} message={text.studio.elementsEmpty} action={<Button to={routes.creatorUpload}>{text.studio.sections.upload}</Button>} />}
      >
        {(data) => {
          const shown = data
            .filter((element) => status === allStatuses || element.status === status)
            .filter((element) => matchesText(query, element.title.en, element.title.ar, ...element.tags.en, ...element.tags.ar));
          return (
            <Stack gap={vars.spacing[4]}>
              <TextField label={text.studio.searchElements} value={query} onChange={setQuery} />
              <ChipGroup<StudioStatus | typeof allStatuses>
                label={text.studio.columns.status}
                value={[status]}
                onChange={(next) => next[0] && setStatus(next[0])}
                options={[
                  { value: allStatuses, label: text.studio.allStatuses },
                  ...studioStatuses.map((option) => ({ value: option, label: text.studio.statuses[option] })),
                ]}
              />
              {shown.length === 0 ? (
                <Text color={vars.colors.textMuted}>{text.studio.elementsNoMatch}</Text>
              ) : (
                <Table
                  label={text.studio.elementsTitle}
                  columns={[
                    { key: 'title', label: text.studio.columns.element },
                    { key: 'category', label: text.studio.category },
                    { key: 'status', label: text.studio.columns.status },
                    { key: 'updated', label: text.studio.columns.date },
                  ]}
                  rows={shown.map((element) => ({
                    key: element.id,
                    cells: {
                      title: (
                        <TextLink to={creatorElementPath(element.id)}>
                          <bdi>{elementTitle(element, text.studio.untitled)}</bdi>
                        </TextLink>
                      ),
                      category: text.categories[element.categoryId].name,
                      status: <StudioStatusBadge status={element.status} />,
                      updated: formatDate(element.updatedAt, locale),
                    },
                  }))}
                />
              )}
            </Stack>
          );
        }}
      </AsyncContent>
    </CreatorArea>
  );
};
