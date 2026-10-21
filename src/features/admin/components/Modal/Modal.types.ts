import type { FormEvent, ReactNode } from 'react';

export interface ModalProps {
  title: string;
  open?: boolean;
  onClose?: () => void; // called by the "Close" button and the Escape key
  children?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void; // wraps the body in a <form> when given
  actions?: ReactNode; // buttons at the bottom (e.g. Cancel + a submit button)
  width?: string;
  maxHeight?: string;
}
