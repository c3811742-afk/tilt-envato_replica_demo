import { useLocale } from '@/shared/hooks';
import { legalPage } from '@/shared/utils';
import { LegalPage } from '@/features/common/components';

export const PrivacyPage = () => {
  const { text, locale } = useLocale();
  const { updatedAt, sections } = legalPage('privacy', locale);
  return <LegalPage title={text.privacy.title} updatedAt={updatedAt} updatedLabel={text.privacy.updated} sections={sections} />;
};
