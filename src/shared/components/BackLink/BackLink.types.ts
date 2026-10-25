export interface BackLinkProps {
  to?: string; // a fixed page to go back to (e.g. the collection a sub-collection is in); without it, the previous page
  label?: string; // e.g. "All my collections"; defaults to "Back"
}
