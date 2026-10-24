import { useState } from 'react';
import { decideAppeal } from '@/features/admin/api';
import { accountStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { AppealOutcome, UserAccount } from '@/features/admin/types';
import { Badge, Button, DetailList, Modal, Notice, Text, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';

interface AppealModalProps {
  user: UserAccount;
  onClose: () => void;
  onDecided: (user: UserAccount, outcome: AppealOutcome) => void;
}

// A suspended user's appeal: why the account was closed, what they wrote, and the decision.
export const AppealModal = ({ user, onClose, onDecided }: AppealModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
  const [note, setNote] = useState('');
  const t = text.admin.users;

  const decide = async (outcome: AppealOutcome) => {
    const result = await run(() => decideAppeal(currentAdmin.id, user.id, outcome, note.trim()));
    if (result.ok) onDecided(result.data, outcome);
  };

  return (
    <Modal
      open
      title={t.appealTitle}
      onClose={onClose}
      actions={
        <>
          <Button variant="muted" disabled={pending} onClick={() => decide('rejected')}>
            {t.rejectAppeal}
          </Button>
          <Button disabled={pending} onClick={() => decide('accepted')}>
            {t.acceptAppeal}
          </Button>
        </>
      }
    >
      <DetailList
        rows={[
          {
            label: t.account,
            value: (
              <Text as="span" autoDirection>
                {user.name} <bdi>({user.email})</bdi>
              </Text>
            ),
          },
          { label: text.admin.columns.status, value: <Badge variant={accountStatusTone[user.status]}>{t.statuses[user.status]}</Badge> },
          ...(user.statusReason ? [{ label: text.admin.columns.reason, value: t.statusReasons[user.statusReason] }] : []),
          ...(user.statusAt ? [{ label: t.since, value: formatDate(user.statusAt, locale) }] : []),
          ...(user.appeal
            ? [
                { label: t.appealSent, value: formatDate(user.appeal.at, locale) },
                { label: t.appealMessage, value: <Text as="span" autoDirection>{user.appeal.message}</Text> },
              ]
            : []),
        ]}
      />
      <Text>{t.appealDecide}</Text>
      {error && <Notice tone="danger">{error}</Notice>}
      <TextField rows={4} label={t.noteLabel} hint={text.admin.common.optional} value={note} onChange={setNote} />
    </Modal>
  );
};
