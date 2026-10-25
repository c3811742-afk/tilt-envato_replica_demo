import { changeUserStatus } from '@/features/admin/api';
import { ReasonModal } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { StatusAction, UserAccount } from '@/features/admin/types';
import { ConfirmModal, Text } from '@/shared/components';
import { suspensionReasons } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { fillText, isolate } from '@/shared/utils';

interface StatusModalProps {
  user: Pick<UserAccount, 'id' | 'name' | 'email'>;
  action: StatusAction;
  onClose: () => void;
  onSaved: (user: UserAccount) => void;
}

// Suspend or ban (with a reason, which the user is shown), or reactivate an account.
export const StatusModal = ({ user, action, onClose, onSaved }: StatusModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
  const t = text.admin.users;
  const name = isolate(user.name);

  const save = async (input: { reason?: (typeof suspensionReasons)[number]; note: string }) => {
    const result = await run(() => changeUserStatus(currentAdmin.id, user.id, { action, ...input }));
    if (result.ok) onSaved(result.data);
  };

  if (action === 'reactivate') {
    return (
      <ConfirmModal
        title={fillText(t.reactivateTitle, { name })}
        confirmLabel={t.reactivate}
        message={t.reactivateMessage}
        pending={pending}
        error={error}
        onConfirm={() => save({ note: '' })}
        onClose={onClose}
      />
    );
  }

  return (
    <ReasonModal
      title={fillText(action === 'ban' ? t.banTitle : t.suspendTitle, { name })}
      confirmLabel={action === 'ban' ? t.ban : t.suspend}
      message={action === 'ban' ? t.banMessage : t.suspendMessage}
      reasons={suspensionReasons}
      reasonLabels={t.statusReasons}
      noteLabel={t.noteLabel}
      tone="danger"
      pending={pending}
      error={error}
      onClose={onClose}
      onSubmit={save}
    >
      <Text autoDirection>
        <strong>{user.name}</strong> <bdi>({user.email})</bdi>
      </Text>
    </ReasonModal>
  );
};
