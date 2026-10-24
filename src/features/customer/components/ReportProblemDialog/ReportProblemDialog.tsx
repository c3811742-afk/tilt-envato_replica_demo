import { useState } from 'react';
import { Button, FieldMessage, Modal, Select } from '@/shared/components';
import { brokenDownloadReasons, type BrokenDownloadReason } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { libraryApi, safeAsync } from '@/shared/utils';

// "A broken download doesn't count once reported": the user says what went wrong.
export const ReportProblemDialog = ({ downloadId, onClose }: { downloadId: string; onClose: () => void }) => {
  const { text } = useLocale();
  const { setAccount } = useSession();
  const { requestError } = useMessages();
  const [reason, setReason] = useState<BrokenDownloadReason>(brokenDownloadReasons[0]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();

  const send = async () => {
    setSending(true);
    const result = await safeAsync(() => libraryApi.reportBroken(downloadId, reason));
    setSending(false);
    if (!result.ok) {
      setError(requestError(result.error));
      return;
    }
    setAccount(result.data);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={text.downloadsPage.reportTitle}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button disabled={sending} onClick={() => void send()}>
            {sending ? text.common.processing : text.downloadsPage.reportSubmit}
          </Button>
        </>
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
