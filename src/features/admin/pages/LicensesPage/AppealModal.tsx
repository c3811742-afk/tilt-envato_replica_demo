import { useState } from 'react';
import { decideElementAppeal } from '@/features/admin/api';
import { appealStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { AppealOutcome, ElementAppeal } from '@/features/admin/types';
import { isBlank } from '@/features/admin/utils';
import { Badge, Button, DetailList, Modal, Notice, Text, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';

interface AppealModalProps {
  appeal: ElementAppeal;
  onClose: () => void;
  onDecided: (appeal: ElementAppeal) => void;
}

// The appeal in full, and the decisions: republish the element (the claim was a false positive) or keep it down.
// Keeping it down needs a note, because the creator is told why.
export const AppealModal = ({ appeal, onClose, onDecided }: AppealModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
  const t = text.admin.elementAppeals;
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string>();
  const open = appeal.status === 'open';

  const decide = async (outcome: AppealOutcome) => {
    if (outcome === 'rejected' && isBlank(note)) {
      setNoteError(t.noteRequired);
      return;
    }
    setNoteError(undefined);
    const result = await run(() => decideElementAppeal(currentAdmin.id, appeal.id, outcome, note));
    if (result.ok) onDecided(result.data);
  };

  return (
    <Modal
      open
      title={t.detailTitle}
      onClose={onClose}
      actions={
        open && (
          <>
            <Button variant="muted" disabled={pending} onClick={() => decide('rejected')}>
              {t.keepDown}
            </Button>
            <Button disabled={pending} onClick={() => decide('accepted')}>
              {t.republish}
            </Button>
          </>
        )
      }
    >
      <DetailList
        rows={[
          { label: text.admin.columns.status, value: <Badge variant={appealStatusTone[appeal.status]}>{t.statuses[appeal.status]}</Badge> },
          { label: text.admin.columns.element, value: <Text as="span" autoDirection>{appeal.element.title}</Text> },
          { label: text.admin.columns.creator, value: <Text as="span" autoDirection>{appeal.creator.name}</Text> },
          ...(appeal.claimReference ? [{ label: t.claimLabel, value: <bdi>{appeal.claimReference}</bdi> }] : []),
          ...(appeal.takedownNote ? [{ label: t.takedownLabel, value: <Text as="span" autoDirection>{appeal.takedownNote}</Text> }] : []),
          { label: t.appealLabel, value: <Text as="span" autoDirection>{appeal.message}</Text> },
          { label: text.admin.columns.received, value: formatDate(appeal.receivedAt, locale) },
          ...(appeal.decisionNote ? [{ label: t.noteLabel, value: <Text as="span" autoDirection>{appeal.decisionNote}</Text> }] : []),
        ]}
      />
      {open && <Text>{t.decideMessage}</Text>}
      {error && <Notice tone="danger">{error}</Notice>}
      {open && <TextField rows={4} label={t.noteLabel} hint={t.noteHint} value={note} onChange={setNote} error={noteError} />}
    </Modal>
  );
};
