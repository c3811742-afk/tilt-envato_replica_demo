import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { modalActionsDefaults } from './ModalActions.defaults';
import type { ModalActionsProps } from './ModalActions.types';

// The buttons at the end of a dialog: "Cancel", then the action. Every dialog uses these, so they look and behave
// the same everywhere (customer, creator and admin).
export const ModalActions = (props: ModalActionsProps) => {
  const { confirmLabel, onCancel, onConfirm, submit, tone, busy, cancelLabel, busyLabel, disabled, confirmTo, confirmIcon } = withDefaults(
    modalActionsDefaults,
    props,
  );
  const { text } = useLocale();

  return (
    <Stack direction="row" wrap justify="flex-end" gap={vars.spacing[3]}>
      <Button variant="outline" onClick={onCancel}>
        {cancelLabel ?? text.common.cancel}
      </Button>
      <Button type={submit ? 'submit' : 'button'} variant={tone} disabled={busy || disabled} to={confirmTo} onClick={submit ? undefined : onConfirm}>
        {confirmIcon && <Icon name={confirmIcon} size={vars.sizes.icon.sm} />}
        {busy ? (busyLabel ?? text.common.processing) : confirmLabel}
      </Button>
    </Stack>
  );
};
