import { useState } from 'react';
import { FieldMessage, Modal, ModalActions, Select } from '@/shared/components';
import { brokenDownloadReasons, type BrokenDownloadReason } from '@/shared/constants';
import { useAccountAction, useLocale } from '@/shared/hooks';
import { libraryApi } from '@/shared/utils';

// "A broken download doesn't count once reported": the user says what went wrong.
export const ReportProblemDialog = ({ downloadId, onClose }: { downloadId: string; onClose: () => void }) => {
  const { text } = useLocale();
  const [reason, setReason] = useState<BrokenDownloadReason>(brokenDownloadReasons[0]);
  const { run, busy: sending, error } = useAccountAction();

  const send = async () => {
    if (await run(() => libraryApi.reportBroken(downloadId, reason))) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={text.downloadsPage.reportTitle}
      actions={
        <ModalActions confirmLabel={sending ? text.common.processing : text.downloadsPage.reportSubmit} onCancel={onClose} busy={sending} onConfirm={() => void send()} />
      }
    >
      <Select
        label={text.downloadsPage.reportReason}
        value={reason}
        onChange={(value) => setReason(value as BrokenDownloadReason)}
        options={brokenDownloadReasons.map((option) => ({ value: option, label: text.downloadsPage.reasons[option] }))}
      />
      <FieldMessage tone="error" message={error} />
    </Modal>
  );
};
