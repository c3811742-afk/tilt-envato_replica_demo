import type { ReactNode } from 'react';

export interface ConfirmModalProps {
  title: string;
  confirmLabel: string; // the action, e.g. "Delete" or "Send"
  message?: ReactNode; // what will happen
  children?: ReactNode; // anything else to show, e.g. the item's name
  tone?: 'primary' | 'danger'; // 'danger' for actions that remove or block something
  pending?: boolean; // disables the button while the action runs
  error?: string; // shown above the buttons when the action failed
  onConfirm?: () => void;
  onClose?: () => void;
}
