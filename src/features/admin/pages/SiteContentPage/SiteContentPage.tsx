import { RequirePermission } from '@/features/admin/components';
import { contentTabs } from '@/features/admin/constants';
import { useTabParam } from '@/features/admin/hooks';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { ArticlesTab } from './ArticlesTab';
import { FaqsTab } from './FaqsTab';
import { LegalTab } from './LegalTab';
import { SectionHeader, Stack, Tabs } from '@/shared/components';

const SiteContent = () => {
  const { text } = useLocale();
  const [tab, setTab] = useTabParam(contentTabs);
  const t = text.admin.content;

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.title} subtitle={t.description} />
      <Tabs
        label={t.tabsLabel}
        tabs={contentTabs.map((value) => ({ value, label: t.tabs[value] }))}
        value={tab}
        onChange={setTab}
      >
        {tab === 'faqs' && <FaqsTab />}
        {tab === 'legal' && <LegalTab />}
        {/* key: a fresh list for each kind of article */}
        {(tab === 'help' || tab === 'learn' || tab === 'releaseNotes') && <ArticlesTab key={tab} tab={tab} />}
      </Tabs>
    </Stack>
  );
};

export const SiteContentPage = () => (
  <RequirePermission permission="manageContent">
    <SiteContent />
  </RequirePermission>
);
