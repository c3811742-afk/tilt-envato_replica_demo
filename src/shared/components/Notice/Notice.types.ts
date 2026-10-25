import type { ReactNode } from 'react';

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

export interface NoticeProps {
  children?: ReactNode;
  tone?: NoticeTone; // 'danger' is announced right away to screen readers
  onDismiss?: () => void; // shows a "Close" button when given
}
