import { useEffect, useState } from 'react';
import { Page, ReleaseNotesList, SegmentedControl } from '@/shared/components';
import type { ReleaseNoteId } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, safeAsync, unreadReleaseNotes } from '@/shared/utils';
import { DownloadsQueue } from './DownloadsQueue';

export type NotificationsTab = 'updates' | 'downloads';
const tabs: NotificationsTab[] = ['updates', 'downloads'];

// Notifications: "What's new" (release notes, unread marked "New") and the download queue.
export const NotificationsPage = () => {
  const { text } = useLocale();
  const { session, setAccount } = useSession();
  const [tab, setTab] = useState<NotificationsTab>('updates');
  // The notes that were unread on arrival stay marked "New" while the page is open.
  const [unread] = useState<ReleaseNoteId[]>(() =>
    session.status === 'signedIn' ? unreadReleaseNotes(session.user).map((note) => note.id) : [],
  );

  // Opening "What's new" marks the release notes as read (the badge in the header goes away).
  useEffect(() => {
    if (!unread.length) return;
    safeAsync(authApi.markReleasesSeen).then((result) => {
      if (result.ok) setAccount(result.data);
      // On failure the notes simply stay unread; safeAsync has logged the error.
    });
  }, [unread, setAccount]);

  return (
    <Page title={text.notifications.title} gap={vars.spacing[5]} contentMaxWidth={vars.sizes.readable.maxWidth}>
      <SegmentedControl<NotificationsTab>
        label={text.notifications.title}
        value={tab}
        onChange={setTab}
        options={tabs.map((key) => ({ value: key, label: text.notifications.tabs[key] }))}
      />
      {tab === 'updates' ? <ReleaseNotesList unread={unread} /> : <DownloadsQueue />}
    </Page>
  );
};
