import type { ReleaseNotesListProps } from './ReleaseNotesList.types';

export const releaseNotesListDefaults: Required<ReleaseNotesListProps> = {
  unread: [],
  limit: Number.POSITIVE_INFINITY, // all of them
};
