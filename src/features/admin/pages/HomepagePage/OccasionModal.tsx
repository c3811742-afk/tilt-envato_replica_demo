import { useState, type FormEvent } from 'react';
import { saveOccasion } from '@/features/admin/api';
import { LocalizedField } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Occasion } from '@/features/admin/types';
import { dateRangeErrors, emptyLocalized, hasErrors, localizedErrors } from '@/features/admin/utils';
import { type DateRange, DateRangeField, Modal, ModalActions, Notice } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

interface OccasionModalProps {
  occasion?: Occasion; // editing; adding when missing
  onClose: () => void;
  onSaved: (occasion: Occasion) => void;
}

export const OccasionModal = ({ occasion, onClose, onSaved }: OccasionModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
  const t = text.admin.homepage.occasions;
  const [name, setName] = useState(occasion?.name ?? emptyLocalized());
  const [headline, setHeadline] = useState(occasion?.headline ?? emptyLocalized());
  const [dates, setDates] = useState<DateRange>({ from: occasion?.startDate ?? '', to: occasion?.endDate ?? '' });
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: localizedErrors(name, text),
    headline: localizedErrors(headline, text),
    dates: dateRangeErrors(dates, text),
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors.name) || hasErrors(errors.headline) || hasErrors(errors.dates)) return;
    const input = { name, headline, startDate: dates.from ?? '', endDate: dates.to ?? '' };
    const result = await run(() => saveOccasion(currentAdmin.id, input, occasion?.id));
    if (result.ok) onSaved(result.data);
  };

  return (
    <Modal
      open
      title={occasion ? t.editTitle : t.add}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <ModalActions confirmLabel={occasion ? text.common.saveChanges : t.add} onCancel={onClose} submit busy={pending} />
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <LocalizedField
        label={t.nameLabel}
        value={name}
        onChange={setName}
        errors={submitted ? errors.name : {}}
        required
      />
      <LocalizedField
        label={t.headlineLabel}
        hint={t.headlineHint}
        value={headline}
        onChange={setHeadline}
        errors={submitted ? errors.headline : {}}
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
