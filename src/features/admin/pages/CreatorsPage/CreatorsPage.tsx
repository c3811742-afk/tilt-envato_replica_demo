import { RequirePermission } from '@/features/admin/components';
import { creatorTabs } from '@/features/admin/constants';
import { useLocale, useTabParam } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { ApplicationsTab } from './ApplicationsTab';
import { IdentityTab } from './IdentityTab';
import { SectionHeader, Stack, Tabs } from '@/shared/components';

const tabContent = { applications: ApplicationsTab, identity: IdentityTab };

const Creators = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(creatorTabs);
  const t = text.admin.creators;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={t.description} />
      <Tabs
        label={t.tabsLabel}
        tabs={creatorTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        <Content />
      </Tabs>
    </Stack>
  );
};

export const CreatorsPage = () => (
  <RequirePermission permission="reviewCreators">
    <Creators />
  </RequirePermission>
);
