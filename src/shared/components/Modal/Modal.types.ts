import type { ReactNode } from 'react';

export interface ModalProps {
  open?: boolean;
  onClose?: () => void; // called on Esc, the close button, or a click outside the dialog
  title?: string;
  children?: ReactNode;
  actions?: ReactNode; // buttons at the bottom of the dialog
  width?: string;
  closeLabel?: string; // accessible name of the close button; defaults to "Close" in the active language
}
