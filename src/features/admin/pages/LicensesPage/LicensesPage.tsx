import { RequirePermission } from '@/features/admin/components';
import { licenseTabs } from '@/features/admin/constants';
import { useLocale, useTabParam } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { ClaimsTab } from './ClaimsTab';
import { LookupTab } from './LookupTab';
import { SectionHeader, Stack, Tabs } from '@/shared/components';

const tabContent = { lookup: LookupTab, claims: ClaimsTab };

const Licenses = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(licenseTabs);
  const t = text.admin.licenses;
  const Content = tabContent[tab];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={t.description} />
      <Tabs
        label={t.tabsLabel}
        tabs={licenseTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        <Content />
      </Tabs>
    </Stack>
  );
};

export const LicensesPage = () => (
  <RequirePermission permission="manageLicenses">
    <Licenses />
  </RequirePermission>
);
