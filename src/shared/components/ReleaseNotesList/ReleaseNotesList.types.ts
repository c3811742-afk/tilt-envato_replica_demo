import type { ReleaseNoteId } from '@/shared/constants';

export interface ReleaseNotesListProps {
  unread?: readonly ReleaseNoteId[]; // marked "New"
  limit?: number; // show only the newest few (e.g. on Home)
}
