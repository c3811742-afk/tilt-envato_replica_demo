import { useEffect, useState } from 'react';
import { Page, ReleaseNotesList, SegmentedControl } from '@/shared/components';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { accountCredits, authApi, planUsage, safeAsync, unreadReleaseNotes } from '@/shared/utils';
import { GenerationQueue } from '@/features/common/components';
import { AlertsList } from './AlertsList';
import { DownloadsQueue } from './DownloadsQueue';

export type NotificationsTab = 'alerts' | 'updates' | 'downloads' | 'generations';
const tabs: NotificationsTab[] = ['alerts', 'updates', 'downloads', 'generations'];

// Notifications: account notifications, "What's new" (release notes), the download queue and the AI image queue.
// What was unread on arrival stays marked "New" while the page is open.
export const NotificationsPage = () => {
  const { text } = useLocale();
  const { session, setAccount } = useSession();
  const user = session.status === 'signedIn' ? session.user : null;
  const [unreadNotes] = useState<string[]>(() => (user ? unreadReleaseNotes(user).map((note) => note.id) : []));
  const [unreadAlerts] = useState<string[]>(() => (user ? user.alerts.filter((alert) => !alert.read).map((alert) => alert.id) : []));
  // Opens on the account notifications when there's something new there, otherwise on "What's new".
  const [tab, setTab] = useState<NotificationsTab>(() => (unreadAlerts.length || !unreadNotes.length ? 'alerts' : 'updates'));

  // Opening a tab marks what it shows as read (the badge in the header goes down).
  useEffect(() => {
    const markRead = tab === 'updates' && unreadNotes.length ? authApi.markReleasesSeen : tab === 'alerts' && unreadAlerts.length ? authApi.markAlertsRead : null;
    if (!markRead) return;
    safeAsync(markRead).then((result) => {
      if (result.ok) setAccount(result.data);
      // On failure they simply stay unread; safeAsync has logged the error.
    });
  }, [tab, unreadNotes, unreadAlerts, setAccount]);

  return (
    <Page title={text.notifications.title} gap={vars.spacing[5]} contentMaxWidth={vars.sizes.readable.maxWidth}>
      <SegmentedControl<NotificationsTab>
        label={text.notifications.title}
        value={tab}
        onChange={setTab}
        options={tabs.map((key) => ({ value: key, label: text.notifications.tabs[key] }))}
      />
      {tab === 'alerts' && <AlertsList alerts={user?.alerts ?? []} unread={unreadAlerts} />}
      {tab === 'updates' && <ReleaseNotesList unread={unreadNotes} />}
      {tab === 'downloads' && <DownloadsQueue />}
      {tab === 'generations' && user && (
        <GenerationQueue
          generations={user.generations}
          queue={session.status === 'signedIn' ? planUsage(session).generations : []}
          concurrent={session.status === 'signedIn' ? accountCredits(session).concurrent : 0}
        />
      )}
    </Page>
  );
};
