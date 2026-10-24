import { useState } from 'react';
import { fetchNewsletters } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import type { Newsletter } from '@/features/admin/types';
import { fillText, isolate } from '@/features/admin/utils';
import {
  AsyncContent,
  Button,
  EmptyState,
  type RecordColumn,
  recordRows,
  Stack,
  Table,
  Text,
} from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, formatNumber } from '@/shared/utils';
import { NewsletterModal } from './NewsletterModal';

// The newsletter goes to everyone who subscribed to it. The list shows what was sent before.
export const NewslettersTab = () => {
  const { text, locale } = useLocale();
  const overview = useAsync(fetchNewsletters, []);
  const [writing, setWriting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.messages.newsletters;

  const columns: RecordColumn<Newsletter>[] = [
    {
      key: 'subject',
      label: text.admin.columns.subject,
      render: (newsletter) => (
        <Text as="span" autoDirection>
          {newsletter.subject}
        </Text>
      ),
    },
    {
      key: 'date',
      label: text.admin.columns.date,
      render: (newsletter) => formatDate(newsletter.sentAt, locale),
    },
    {
      key: 'recipients',
      label: text.admin.columns.recipients,
      render: (newsletter) => formatNumber(newsletter.recipients, locale),
    },
    {
      key: 'sentBy',
      label: text.admin.columns.sentBy,
      render: (newsletter) => (
        <Text as="span" autoDirection>
          {newsletter.sentBy}
        </Text>
      ),
    },
  ];

  return (
    <Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={overview}>
        {(data) => (
          <Stack>
            <Stack direction="row" wrap align="center">
              <Text color={vars.colors.textMuted}>
                {fillText(t.subscribers, { count: formatNumber(data.subscribers, locale) })}
              </Text>
              <Button onClick={() => setWriting(true)}>{t.new}</Button>
            </Stack>
            {data.sent.length > 0 ? (
              <Table label={t.tableLabel} columns={columns} rows={recordRows(data.sent, (newsletter) => newsletter.id, columns)} stackOnMobile />
            ) : (
              <EmptyState title={t.emptyTitle} message={t.emptyMessage} />
            )}
            {writing && (
              <NewsletterModal
                subscribers={data.subscribers}
                onClose={() => setWriting(false)}
                onSent={(newsletter) => {
                  overview.update({ ...data, sent: [newsletter, ...data.sent] });
                  setWriting(false);
                  setNotice(
                    fillText(t.sent, {
                      subject: isolate(newsletter.subject),
                      count: formatNumber(newsletter.recipients, locale),
                    }),
                  );
                }}
              />
            )}
          </Stack>
        )}
      </AsyncContent>
    </Stack>
  );
};
