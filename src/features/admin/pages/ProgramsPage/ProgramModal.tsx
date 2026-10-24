import { useState, type FormEvent } from 'react';
import { saveProgram } from '@/features/admin/api';
import { DateRangeField, Modal, Notice, SelectField, TextField } from '@/features/admin/components';
import { programKinds } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Program, ProgramKind } from '@/features/admin/types';
import { dateRangeErrors, hasErrors, isBlank, isOneOf } from '@/features/admin/utils';
import { Button } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

interface ProgramModalProps {
  program?: Program; // editing; adding when missing
  onClose: () => void;
  onSaved: (program: Program) => void;
}

// A student program or a competition. Competitions also have a results date and a prize.
export const ProgramModal = ({ program, onClose, onSaved }: ProgramModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const t = text.admin.programs;
  const [kind, setKind] = useState<ProgramKind>(program?.kind ?? 'studentProgram');
  const [name, setName] = useState(program?.name ?? '');
  const [university, setUniversity] = useState(program?.university ?? '');
  const [description, setDescription] = useState(program?.description ?? '');
  const [dates, setDates] = useState({ start: program?.startDate ?? '', end: program?.endDate ?? '' });
  const [resultsDate, setResultsDate] = useState(program?.resultsDate ?? '');
  const [prize, setPrize] = useState(program?.prize ?? '');
  const [submitted, setSubmitted] = useState(false);
  const isCompetition = kind === 'competition';

  const errors = {
    name: isBlank(name) ? t.nameRequired : undefined,
    university: isBlank(university) ? t.universityRequired : undefined,
    ...dateRangeErrors(dates, text),
    resultsDate: isCompetition && resultsDate && dates.end && resultsDate < dates.end ? t.resultsBeforeEnd : undefined,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;
    const input = {
      kind,
      name,
      university,
      description,
      startDate: dates.start,
      endDate: dates.end,
      resultsDate,
      prize,
    };
    const result = await run(() => saveProgram(currentAdmin.id, input, program?.id));
    if (result.ok) onSaved(result.data);
  };

  return (
    <Modal
      open
      title={program ? t.editTitle : t.add}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {program ? text.admin.common.save : t.add}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <SelectField
        label={t.kindLabel}
        options={programKinds.map((value) => ({ value, label: t.kinds[value] }))}
        value={kind}
        onChange={(value) => isOneOf(programKinds, value) && setKind(value)}
      />
      <TextField
        label={t.nameLabel}
        value={name}
        onChange={setName}
        error={submitted ? errors.name : undefined}
        required
        autoDirection
      />
      <TextField
        label={t.universityLabel}
        hint={t.universityHint}
        value={university}
        onChange={setUniversity}
        error={submitted ? errors.university : undefined}
        required
        autoDirection
      />
      <TextField
        multiline
        label={t.descriptionLabel}
        hint={text.admin.common.optional}
        value={description}
        onChange={setDescription}
        autoDirection
      />
      <DateRangeField
        value={dates}
        onChange={setDates}
        endLabel={isCompetition ? t.entriesCloseLabel : undefined}
        errors={submitted ? { start: errors.start, end: errors.end } : {}}
      />
      {isCompetition && (
        <>
          <TextField
            type="date"
            label={t.resultsDateLabel}
            hint={text.admin.common.optional}
            value={resultsDate}
            min={dates.end || undefined}
            onChange={setResultsDate}
            error={submitted ? errors.resultsDate : undefined}
          />
          <TextField
            label={t.prizeLabel}
            hint={text.admin.common.optional}
            value={prize}
            onChange={setPrize}
            autoDirection
          />
        </>
      )}
    </Modal>
  );
};
