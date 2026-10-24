import { useState } from 'react';
import { generatePath } from 'react-router';
import { fetchTickets } from '@/features/admin/api';
import {
  Badge,
  DataTable,
  FilterBar,
  SelectField,
  Stack,
  TextLink,
  type DataTableColumn,
} from '@/features/admin/components';
import { ticketStatuses, ticketStatusTone } from '@/features/admin/constants';
import type { Ticket, TicketStatus } from '@/features/admin/types';
import { isOneOf } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
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

  const columns: DataTableColumn<Ticket>[] = [
    {
      key: 'subject',
      header: text.admin.columns.subject,
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
      header: text.admin.columns.from,
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
      header: text.admin.columns.updated,
      render: (ticket) => formatDate(ticket.updatedAt, locale, dateTime),
    },
    {
      key: 'status',
      header: text.admin.columns.status,
      render: (ticket) => <Badge tone={ticketStatusTone[ticket.status]}>{t.statuses[ticket.status]}</Badge>,
    },
  ];

  return (
    <AsyncContent state={tickets} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
      {(list) => {
        const visible = list.filter((ticket) => status === allStatuses || ticket.status === status);
        return (
          <Stack>
            <FilterBar>
              <SelectField
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
              <DataTable label={t.tabs.tickets} columns={columns} rows={visible} getRowKey={(ticket) => ticket.id} />
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
