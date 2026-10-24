export interface DetailRow {
  label: string;
  value: string;
  autoDirection?: boolean; // the value is user content that may be in either language
}

export interface DetailListProps {
  rows?: DetailRow[];
  dividerColor?: string;
}
