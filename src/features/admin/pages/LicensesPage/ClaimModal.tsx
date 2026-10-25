import { useState } from 'react';
import { decideClaim } from '@/features/admin/api';
import { claimStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { ClaimDecision, CopyrightClaim } from '@/features/admin/types';
import { isBlank } from '@/features/admin/utils';
import { Badge, Button, DetailList, Modal, Notice, Text, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { fillText, formatDate } from '@/shared/utils';

interface ClaimModalProps {
  claim: CopyrightClaim;
  onClose: () => void;
  onDecided: (claim: CopyrightClaim) => void;
}

// The claim in full, and the decisions: look into it, take the element down, or reject the claim.
// Rejecting needs a note, because the claimant is told why.
export const ClaimModal = ({ claim, onClose, onDecided }: ClaimModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
  const t = text.admin.claims;
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string>();
  const open = claim.status === 'new' || claim.status === 'investigating';

  const decide = async (decision: ClaimDecision) => {
    if (decision === 'rejected' && isBlank(note)) {
      setNoteError(t.noteRequired);
      return;
    }
    setNoteError(undefined);
    const result = await run(() => decideClaim(currentAdmin.id, claim.id, decision, note));
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
            {claim.status === 'new' && (
              <Button variant="muted" disabled={pending} onClick={() => decide('investigating')}>
                {t.investigate}
              </Button>
            )}
            <Button variant="muted" disabled={pending} onClick={() => decide('rejected')}>
              {t.reject}
            </Button>
            <Button variant="danger" disabled={pending} onClick={() => decide('takenDown')}>
              {t.takeDown}
            </Button>
          </>
        )
      }
    >
      <DetailList
        rows={[
          { label: text.admin.columns.status, value: <Badge variant={claimStatusTone[claim.status]}>{t.statuses[claim.status]}</Badge> },
          { label: text.admin.columns.element, value: <Text as="span" autoDirection>{claim.element.title}</Text> },
          {
            label: t.claimantLabel,
            value: (
              <>
                <Text as="span" autoDirection>
                  {claim.claimant.company
                    ? fillText(t.claimantWithCompany, { name: claim.claimant.name, company: claim.claimant.company })
                    : claim.claimant.name}
                </Text>{' '}
                <bdi>({claim.claimant.email})</bdi>
              </>
            ),
          },
          ...(claim.originalLink ? [{ label: t.originalLabel, value: <bdi>{claim.originalLink}</bdi> }] : []),
          { label: t.descriptionLabel, value: <Text as="span" autoDirection>{claim.description}</Text> },
          { label: text.admin.columns.received, value: formatDate(claim.receivedAt, locale) },
          ...(claim.decisionNote
            ? [{ label: t.decisionNoteLabel, value: <Text as="span" autoDirection>{claim.decisionNote}</Text> }]
            : []),
        ]}
      />
      {open && <Text>{t.decideMessage}</Text>}
      {error && <Notice tone="danger">{error}</Notice>}
      {open && (
        <TextField rows={4}
          label={t.noteLabel}
          hint={t.noteHint}
          value={note}
          onChange={setNote}
          error={noteError}
        />
      )}
    </Modal>
  );
};
