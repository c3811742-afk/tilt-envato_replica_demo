import { PageHeader, RequirePermission, Stack, Tabs } from '@/features/admin/components';
import { homepageTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { BannersTab } from './BannersTab';
import { FeaturedTab } from './FeaturedTab';
import { FreeElementsTab } from './FreeElementsTab';
import { OccasionsTab } from './OccasionsTab';

const tabContent = {
  featured: FeaturedTab,
  occasions: OccasionsTab,
  freeElements: FreeElementsTab,
  banners: BannersTab,
};

const Homepage = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(homepageTabs);
  const t = text.admin.homepage;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.title} description={t.description} />
      <Tabs
        label={t.tabsLabel}
        tabs={homepageTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        <Content />
      </Tabs>
    </Stack>
  );
};

export const HomepagePage = () => (
  <RequirePermission permission="manageHomepage">
    <Homepage />
  </RequirePermission>
);
