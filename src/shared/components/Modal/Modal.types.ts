import type { FormEvent, ReactNode } from 'react';

export type ModalPlacement = 'center' | 'side';

export interface ModalProps {
  open?: boolean;
  onClose?: () => void; // called on Esc, the close button, or a click outside the dialog
  title?: string;
  children?: ReactNode;
  actions?: ReactNode; // buttons at the bottom of the dialog
  width?: string;
  placement?: ModalPlacement; // 'center': a dialog; 'side': a full-height panel along the end edge
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void; // makes the dialog a form: the actions' submit button sends it
  closeLabel?: string; // accessible name of the close button; defaults to "Close" in the active language
}
