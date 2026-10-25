import type { ReactNode } from 'react';

export interface ReasonInput<R extends string> {
  reason: R;
  note: string;
}

export interface ReasonModalProps<R extends string> {
  title: string;
  confirmLabel: string;
  reasons: readonly R[];
  reasonLabels: Record<R, string>;
  onSubmit: (input: ReasonInput<R>) => void;
  onClose?: () => void;
  children?: ReactNode; // what the action is about, e.g. the element title
  message?: string; // what will happen
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonRequired?: string; // shown when no reason is chosen
  noteLabel?: string;
  noteHint?: string;
  tone?: 'primary' | 'danger';
  pending?: boolean;
  error?: string;
}
