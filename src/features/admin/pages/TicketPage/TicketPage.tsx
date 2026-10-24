import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { fetchTicket, replyToTicket, setTicketClosed } from '@/features/admin/api';
import { Notice, RequirePermission } from '@/features/admin/components';
import { ticketStatusTone } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Ticket } from '@/features/admin/types';
import { fillText, isBlank, isolate } from '@/features/admin/utils';
import {
  AsyncContent,
  Badge,
  Button,
  Card,
  EmptyState,
  SectionHeader,
  Stack,
  Text,
  TextField,
  TextLink,
} from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';
import styles from './TicketPage.module.css';

const dateTime: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

interface TicketViewProps {
  ticket: Ticket;
  onChange: (ticket: Ticket) => void;
}

// The conversation, oldest message first, with a reply box at the end.
const TicketView = ({ ticket, onChange }: TicketViewProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const reply = useAdminAction();
  const status = useAdminAction();
  const [body, setBody] = useState('');
  const [bodyError, setBodyError] = useState<string>();
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.support;
  const closed = ticket.status === 'closed';

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (isBlank(body)) {
      setBodyError(t.replyRequired);
      return;
    }
    setBodyError(undefined);
    const result = await reply.run(() => replyToTicket(currentAdmin.id, ticket.id, body));
    if (!result.ok) return;
    onChange(result.data);
    setBody('');
    setNotice(fillText(t.replied, { name: isolate(ticket.requester.name) }));
  };

  const toggleClosed = async () => {
    setNotice(null);
    const result = await status.run(() => setTicketClosed(currentAdmin.id, ticket.id, !closed));
    if (!result.ok) return;
    onChange(result.data);
    setNotice(closed ? t.reopened : t.closed);
  };

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1"
        title={ticket.subject}
        autoDirection
        subtitle={fillText(t.ticketLine, {
          name: isolate(ticket.requester.name),
          kind: t.requesterKinds[ticket.requester.kind],
          topic: t.topics[ticket.topic],
        })}
        actions={
          <>
            <Badge variant={ticketStatusTone[ticket.status]}>{t.statuses[ticket.status]}</Badge>
            <Button variant="muted" size="sm" disabled={status.pending} onClick={toggleClosed}>
              {closed ? t.reopen : t.close}
            </Button>
          </>
        }
      />
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {status.error && <Notice tone="danger">{status.error}</Notice>}
      <ol className={styles.thread}>
        {ticket.messages.map((message) => (
          <li key={message.id} className={message.fromSupport ? styles.fromSupport : styles.fromUser}>
            <Stack gap={vars.spacing[2]}>
              <Text as="span" variant="label" color={vars.colors.textMuted}>
                {fillText(message.fromSupport ? t.supportWrote : t.userWrote, {
                  name: isolate(message.authorName),
                  date: formatDate(message.at, locale, dateTime),
                })}
              </Text>
              <Text autoDirection>{message.body}</Text>
            </Stack>
          </li>
        ))}
      </ol>
      {closed ? (
        <Notice tone="info">{t.closedNote}</Notice>
      ) : (
        <Card title={t.replyTitle}>
          <form noValidate onSubmit={send}>
            <Stack>
              {reply.error && <Notice tone="danger">{reply.error}</Notice>}
              <TextField rows={4}
                label={t.replyLabel}
                hint={fillText(t.replyHint, { email: isolate(ticket.requester.email) })}
                value={body}
                onChange={setBody}
                error={bodyError}
                required
              />
              <Stack direction="row" wrap>
                <Button type="submit" disabled={reply.pending}>
                  {t.send}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Card>
      )}
    </Stack>
  );
};

const TicketScreen = () => {
  const { ticketId = '' } = useParams();
  const { text } = useLocale();
  const navigate = useNavigate();
  const ticket = useAsync(() => fetchTicket(ticketId), [ticketId]);
  const t = text.admin.support;

  return (
    <Stack>
      <TextLink to={routes.adminSupport}>{t.back}</TextLink>
      <AsyncContent
        state={ticket}
        empty={
          <EmptyState
            title={t.notFoundTitle}
            message={t.notFoundMessage}
            action={<Button onClick={() => navigate(routes.adminSupport)}>{t.back}</Button>}
          />
        }
      >
        {(data) => data && <TicketView ticket={data} onChange={ticket.update} />}
      </AsyncContent>
    </Stack>
  );
};

export const TicketPage = () => (
  <RequirePermission permission="handleSupport">
    <TicketScreen />
  </RequirePermission>
);
