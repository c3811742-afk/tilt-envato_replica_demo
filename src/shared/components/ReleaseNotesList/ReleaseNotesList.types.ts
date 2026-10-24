export interface ReleaseNotesListProps {
  unread?: readonly string[]; // ids marked "New"
  limit?: number; // show only the newest few (e.g. on Home)
}
