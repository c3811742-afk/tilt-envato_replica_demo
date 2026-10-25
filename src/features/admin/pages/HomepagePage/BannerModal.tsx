import { useState, type FormEvent } from 'react';
import { saveBanner } from '@/features/admin/api';
import { LocalizedField } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Banner } from '@/features/admin/types';
import { dateRangeErrors, emptyLocalized, hasErrors, isValidLink, localizedErrors } from '@/features/admin/utils';
import { type DateRange, DateRangeField, Modal, ModalActions, Notice, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

interface BannerModalProps {
  banner?: Banner; // editing; adding when missing
  onClose: () => void;
  onSaved: (banner: Banner) => void;
}

export const BannerModal = ({ banner, onClose, onSaved }: BannerModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
  const t = text.admin.homepage.banners;
  const [message, setMessage] = useState(banner?.text ?? emptyLocalized());
  const [link, setLink] = useState(banner?.link ?? '');
  const [dates, setDates] = useState<DateRange>({ from: banner?.startDate ?? '', to: banner?.endDate ?? '' });
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
    const input = { text: message, link, startDate: dates.from ?? '', endDate: dates.to ?? '' };
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
        <ModalActions confirmLabel={banner ? text.common.saveChanges : t.add} onCancel={onClose} submit busy={pending} />
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
      <DateRangeField
        value={dates}
        onChange={setDates}
        fromLabel={text.admin.common.startDate}
        toLabel={text.admin.common.endDate}
        errors={submitted ? errors.dates : {}}
        required
      />
    </Modal>
  );
};
