import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, publishedReleaseNotes, withDefaults } from '@/shared/utils';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { releaseNotesListDefaults } from './ReleaseNotesList.defaults';
import type { ReleaseNotesListProps } from './ReleaseNotesList.types';

// "What's new": release notes, newest first (the team publishes them from the admin).
export const ReleaseNotesList = (props: ReleaseNotesListProps) => {
  const { unread, limit } = withDefaults(releaseNotesListDefaults, props);
  const { text, locale } = useLocale();

  return (
    <Stack as="ul" gap={vars.spacing[3]}>
      {publishedReleaseNotes()
        .slice(0, limit)
        .map((note) => (
          <Card key={note.id} as="li" gap={vars.spacing[2]}>
            <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
              <Text as="h3" variant="title" autoDirection>
                {note.title[locale]}
              </Text>
              {unread.includes(note.id) && <Badge variant="highlight">{text.notifications.newBadge}</Badge>}
            </Stack>
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {formatDate(note.date, locale)}
            </Text>
            <Text autoDirection>{note.text[locale]}</Text>
          </Card>
        ))}
    </Stack>
  );
};
