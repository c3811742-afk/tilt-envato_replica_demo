import { useState, type FormEvent } from 'react';
import { saveBanner } from '@/features/admin/api';
import { DateRangeField, LocalizedField, Modal, Notice, TextField } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Banner } from '@/features/admin/types';
import { dateRangeErrors, emptyLocalized, hasErrors, isValidLink, localizedErrors } from '@/features/admin/utils';
import { Button } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

interface BannerModalProps {
  banner?: Banner; // editing; adding when missing
  onClose: () => void;
  onSaved: (banner: Banner) => void;
}

export const BannerModal = ({ banner, onClose, onSaved }: BannerModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.homepage.banners;
  const [message, setMessage] = useState(banner?.text ?? emptyLocalized());
  const [link, setLink] = useState(banner?.link ?? '');
  const [dates, setDates] = useState({ start: banner?.startDate ?? '', end: banner?.endDate ?? '' });
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    text: localizedErrors(message, text),
    dates: dateRangeErrors(dates, text),
    link: isValidLink(link) ? undefined : text.admin.common.linkInvalid,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors.text) || hasErrors(errors.dates) || errors.link) return;
    const input = { text: message, link, startDate: dates.start, endDate: dates.end };
    const result = await run(() => saveBanner(currentAdmin.id, input, banner?.id));
    if (result.ok) onSaved(result.data);
  };

  return (
    <Modal
      open
      title={banner ? t.editTitle : t.add}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {banner ? text.admin.common.save : t.add}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <LocalizedField
        label={t.textLabel}
        value={message}
        onChange={setMessage}
        errors={submitted ? errors.text : {}}
        required
      />
      <TextField
        type="url"
        label={text.admin.common.linkLabel}
        placeholder={text.admin.common.linkPlaceholder}
        value={link}
        onChange={setLink}
        error={submitted ? errors.link : undefined}
        required
      />
      <DateRangeField value={dates} onChange={setDates} errors={submitted ? errors.dates : {}} />
    </Modal>
  );
};
