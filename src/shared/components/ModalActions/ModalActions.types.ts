import type { IconName } from '@/shared/assets';
import type { ButtonVariant } from '../Button';

export interface ModalActionsProps {
  confirmLabel: string; // the action, e.g. "Delete" or "Save"
  onCancel?: () => void;
  onConfirm?: () => void; // not needed when `submit` (the form's own submit runs it)
  submit?: boolean; // the confirm button submits the form the actions are in
  tone?: ButtonVariant; // the action button's style: 'danger' for actions that remove or block something
  busy?: boolean; // the action is running: the button is disabled and says "Processing…"
  cancelLabel?: string; // defaults to "Cancel"
  busyLabel?: string; // shown on the action while busy; defaults to "Processing…"
  disabled?: boolean; // the action can't run yet (e.g. nothing changed)
  confirmTo?: string; // the action is a page to go to (e.g. "View plans") instead of a button
  confirmIcon?: IconName; // shown before the action's label
}
