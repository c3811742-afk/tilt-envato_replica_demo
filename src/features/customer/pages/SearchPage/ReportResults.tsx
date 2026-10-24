import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router';
import { Button, ChipGroup, FieldMessage, Modal, Stack, Text, TextField, TextLink } from '@/shared/components';
import { routes, searchReportReasons, withReturnTo, type SearchReportReason } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { CategoryId } from '@/shared/types';
import { api, safeAsync } from '@/shared/utils';

interface ReportResultsProps {
  query: string;
  categoryId?: CategoryId;
}

// "Results not what you expected?": signed-in users can report any set of results that doesn't match,
// with or without a keyword, filtered or not, including no results.
export const ReportResults = ({ query, categoryId }: ReportResultsProps) => {
  const { text } = useLocale();
  const { session } = useSession();
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <Stack direction="row" wrap align="center" justify="center" gap={vars.spacing[2]}>
      <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
        {text.search.reportPrompt}
      </Text>
      {session.status === 'signedIn' ? (
        <TextLink variant="bodySm" onClick={() => setOpen(true)}>
          {text.searchReport.link}
        </TextLink>
      ) : (
        <TextLink variant="bodySm" to={withReturnTo(routes.signIn, `${pathname}${search}`)}>
          {text.searchReport.signIn}
        </TextLink>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={text.searchReport.title}>
        {open && <ReportForm query={query} categoryId={categoryId} onDone={() => setOpen(false)} />}
      </Modal>
    </Stack>
  );
};

const ReportForm = ({ query, categoryId, onDone }: ReportResultsProps & { onDone: () => void }) => {
  const { text } = useLocale();
  const { pathname, search } = useLocation();
  const [reason, setReason] = useState<SearchReportReason | null>(null);
  const [comment, setComment] = useState('');
  const [reasonError, setReasonError] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent' | 'failed'>('idle');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!reason) return setReasonError(true);
    setSending(true);
    const result = await safeAsync(() => api.reportSearch({ query, searchUrl: `${pathname}${search}`, categoryId, reason, comment: comment.trim() }));
    setSending(false);
    setStatus(result.ok ? 'sent' : 'failed');
  };

  if (status === 'sent') {
    return (
      <Stack gap={vars.spacing[4]}>
        <Text>{text.searchReport.sent}</Text>
        <div>
          <Button onClick={onDone}>{text.common.done}</Button>
        </div>
      </Stack>
    );
  }

  return (
    <Stack as="form" gap={vars.spacing[5]} onSubmit={submit} noValidate>
      <Text color={vars.colors.textMuted}>{text.searchReport.intro}</Text>
      <ChipGroup
        label={text.searchReport.reasonLabel}
        value={reason ? [reason] : []}
        onChange={(values) => {
          setReason(values[0] ?? null);
          setReasonError(false);
        }}
        options={searchReportReasons.map((value) => ({ value, label: text.searchReport.reasons[value] }))}
        error={reasonError ? text.searchReport.reasonRequired : undefined}
      />
      <TextField label={text.searchReport.commentLabel} placeholder={text.searchReport.commentPlaceholder} value={comment} onChange={setComment} />
      <FieldMessage tone="error" message={status === 'failed' ? text.searchReport.failed : undefined} />
      <Stack direction="row" justify="flex-end" gap={vars.spacing[3]}>
        <Button variant="outline" onClick={onDone}>
          {text.common.cancel}
        </Button>
        <Button type="submit" disabled={sending}>
          {sending ? text.common.processing : text.searchReport.submit}
        </Button>
      </Stack>
    </Stack>
  );
};
