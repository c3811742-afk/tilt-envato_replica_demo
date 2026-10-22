import { useEffect, useState } from 'react';
import { Badge, Button, Card, EmptyState, Icon, Stack, Text, TextLink } from '@/shared/components';
import { itemPath } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { downloadStatus, downloadTextFile, fillText, formatDate, toFileName } from '@/shared/utils';

const tickMs = 1000;
const dateTimeFormat: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

// "See my download queue in notifications": each download is "Preparing", then "Ready" to download again.
export const DownloadsQueue = () => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const downloads = session.status === 'signedIn' ? session.user.downloads : [];
  const [now, setNow] = useState(() => Date.now());
  const preparing = downloads.some((download) => downloadStatus(download, now) === 'preparing');

  // While something is preparing, check every second so it turns "Ready" on its own.
  useEffect(() => {
    if (!preparing) return;
    const timer = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(timer);
  }, [preparing]);

  if (!downloads.length) return <EmptyState title={text.notifications.tabs.downloads} message={text.notifications.downloadsEmpty} />;

  return (
    <Stack as="ul" gap={vars.spacing[3]}>
      {downloads.map((download) => {
        const ready = downloadStatus(download, now) === 'ready';
        return (
          <Card key={download.id} as="li" gap={vars.spacing[2]}>
            <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
              <TextLink to={itemPath(download.itemId)} variant="title">
                <span dir="auto">{download.itemTitle}</span>
              </TextLink>
              <Badge variant={ready ? 'free' : 'neutral'}>{ready ? text.notifications.ready : text.notifications.preparing}</Badge>
            </Stack>
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {fillText(text.notifications.project, { project: download.projectName })} · {formatDate(download.requestedAt, locale, dateTimeFormat)}
            </Text>
            {ready && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadTextFile(`${toFileName(download.itemTitle)}.txt`, fillText(text.license.demoFile, { title: download.itemTitle }))
                  }
                >
                  <Icon name="download" size={vars.sizes.icon.sm} />
                  {text.item.download}
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </Stack>
  );
};
