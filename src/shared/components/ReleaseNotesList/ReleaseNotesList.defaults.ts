import { releaseNotes } from '@/shared/constants';
import type { ReleaseNotesListProps } from './ReleaseNotesList.types';

export const releaseNotesListDefaults: Required<ReleaseNotesListProps> = {
  unread: [],
  limit: releaseNotes.length,
};
