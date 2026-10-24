import { useState } from 'react';
import { generatePath } from 'react-router';
import { fetchTickets } from '@/features/admin/api';
import { FilterBar } from '@/features/admin/components';
import { ticketStatuses, ticketStatusTone } from '@/features/admin/constants';
import type { Ticket, TicketStatus } from '@/features/admin/types';
import { isOneOf } from '@/features/admin/utils';
import {
  AsyncContent,
  Badge,
  Button,
  EmptyState,
  type RecordColumn,
  recordRows,
  Select,
  Stack,
  Table,
  Text,
  TextLink,
} from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';

const allStatuses = 'all';
const dateTime: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

// Tickets from customers and creators. Open ones (waiting for support) first.
export const TicketsTab = () => {
  const { text, locale } = useLocale();
  const tickets = useAsync(fetchTickets, []);
  const [status, setStatus] = useState<TicketStatus | typeof allStatuses>(allStatuses);
  const t = text.admin.support;

  const columns: RecordColumn<Ticket>[] = [
    {
      key: 'subject',
      label: text.admin.columns.subject,
      render: (ticket) => (
        <Stack gap={vars.spacing[1]}>
          <TextLink to={generatePath(routes.adminTicket, { ticketId: ticket.id })} autoDirection>
            {ticket.subject}
          </TextLink>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {t.topics[ticket.topic]}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'from',
      label: text.admin.columns.from,
      render: (ticket) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            {ticket.requester.name}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {t.requesterKinds[ticket.requester.kind]}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'updated',
      label: text.admin.columns.updated,
      render: (ticket) => formatDate(ticket.updatedAt, locale, dateTime),
    },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (ticket) => <Badge variant={ticketStatusTone[ticket.status]}>{t.statuses[ticket.status]}</Badge>,
    },
  ];

  return (
    <AsyncContent state={tickets} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
      {(list) => {
        const visible = list.filter((ticket) => status === allStatuses || ticket.status === status);
        return (
          <Stack>
            <FilterBar>
              <Select
                label={text.admin.columns.status}
                options={[
                  { value: allStatuses, label: t.allStatuses },
                  ...ticketStatuses.map((value) => ({ value, label: t.statuses[value] })),
                ]}
                value={status}
                onChange={(value) => setStatus(isOneOf(ticketStatuses, value) ? value : allStatuses)}
              />
            </FilterBar>
            {visible.length > 0 ? (
              <Table label={t.tabs.tickets} columns={columns} rows={recordRows(visible, (ticket) => ticket.id, columns)} stackOnMobile />
            ) : (
              <EmptyState
                title={t.noneTitle}
                message={t.noneMessage}
                action={<Button onClick={() => setStatus(allStatuses)}>{t.showAll}</Button>}
              />
            )}
          </Stack>
        );
      }}
    </AsyncContent>
  );
};
