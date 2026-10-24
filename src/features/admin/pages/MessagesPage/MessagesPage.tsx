import { Notice, PageHeader, RequirePermission, Stack, Tabs } from '@/features/admin/components';
import { messageTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { AnnouncementsTab } from './AnnouncementsTab';
import { NewslettersTab } from './NewslettersTab';

const tabContent = { announcements: AnnouncementsTab, newsletters: NewslettersTab };

const Messages = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(messageTabs);
  const t = text.admin.messages;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.title} description={t.description} />
      <Notice tone="info">{t.demoNote}</Notice>
      <Tabs
        label={t.tabsLabel}
        tabs={messageTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        <Content />
      </Tabs>
    </Stack>
  );
};

export const MessagesPage = () => (
  <RequirePermission permission="sendMessages">
    <Messages />
  </RequirePermission>
);
