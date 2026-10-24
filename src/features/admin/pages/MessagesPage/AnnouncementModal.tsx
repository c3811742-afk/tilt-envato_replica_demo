import { useState, type FormEvent } from 'react';
import { fetchAudienceSizes, sendAnnouncement } from '@/features/admin/api';
import { ConfirmModal, Modal, Notice, SelectField, TextField } from '@/features/admin/components';
import { audiences } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Announcement, Audience } from '@/features/admin/types';
import { fillText, hasErrors, isBlank, isOneOf, toDateTimeKey } from '@/features/admin/utils';
import { AsyncContent, Button } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { formatDate, formatNumber } from '@/shared/utils';

const timings = ['now', 'later'] as const;
type Timing = (typeof timings)[number];
const dateTime: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

interface AnnouncementModalProps {
  onClose: () => void;
  onSent: (announcement: Announcement) => void;
}

// Write the announcement, then confirm who gets it and when. Demo: nothing is really sent.
export const AnnouncementModal = ({ onClose, onSent }: AnnouncementModalProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const sizes = useAsync(fetchAudienceSizes, []);
  const t = text.admin.messages.announcements;
  const [audience, setAudience] = useState<Audience>('customers');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [timing, setTiming] = useState<Timing>('now');
  const [sendAt, setSendAt] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const errors = {
    title: isBlank(title) ? t.titleRequired : undefined,
    body: isBlank(body) ? t.bodyRequired : undefined,
    sendAt:
      timing === 'now' ? undefined : !sendAt ? t.sendAtRequired : sendAt <= toDateTimeKey() ? t.sendAtPast : undefined,
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!hasErrors(errors)) setConfirming(true);
  };

  const send = async () => {
    const input = { audience, title, body, sendAt: timing === 'later' ? new Date(sendAt).toISOString() : null };
    const result = await run(() => sendAnnouncement(currentAdmin.id, input));
    if (result.ok) onSent(result.data);
  };

  if (confirming && sizes.status === 'success') {
    const values = {
      count: formatNumber(sizes.data[audience], locale),
      audience: t.audiences[audience],
      date: sendAt ? formatDate(new Date(sendAt), locale, dateTime) : '',
    };
    return (
      <ConfirmModal
        title={timing === 'later' ? t.confirmScheduleTitle : t.confirmSendTitle}
        confirmLabel={timing === 'later' ? t.schedule : t.send}
        message={fillText(timing === 'later' ? t.confirmSchedule : t.confirmSend, values)}
        pending={pending}
        error={error}
        onConfirm={send}
        onClose={() => setConfirming(false)}
      />
    );
  }

  return (
    <Modal
      open
      title={t.newTitle}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={sizes.status !== 'success'}>
            {text.admin.common.continue}
          </Button>
        </>
      }
    >
      <AsyncContent state={sizes}>
        {(counts) => (
          <>
            <SelectField
              label={t.audienceLabel}
              options={audiences.map((value) => ({
                value,
                label: fillText(t.audienceOption, {
                  audience: t.audiences[value],
                  count: formatNumber(counts[value], locale),
                }),
              }))}
              value={audience}
              onChange={(value) => isOneOf(audiences, value) && setAudience(value)}
            />
            <TextField
              label={t.titleLabel}
              value={title}
              onChange={setTitle}
              error={submitted ? errors.title : undefined}
              required
              autoDirection
            />
            <TextField
              multiline
              label={t.bodyLabel}
              value={body}
              onChange={setBody}
              error={submitted ? errors.body : undefined}
              required
              autoDirection
            />
            <SelectField
              label={t.timingLabel}
              options={timings.map((value) => ({ value, label: t.timings[value] }))}
              value={timing}
              onChange={(value) => isOneOf(timings, value) && setTiming(value)}
            />
            {timing === 'later' && (
              <TextField
                type="datetime-local"
                label={t.sendAtLabel}
                value={sendAt}
                min={toDateTimeKey()}
                onChange={setSendAt}
                error={submitted ? errors.sendAt : undefined}
                required
              />
            )}
            {error && <Notice tone="danger">{error}</Notice>}
          </>
        )}
      </AsyncContent>
    </Modal>
  );
};
