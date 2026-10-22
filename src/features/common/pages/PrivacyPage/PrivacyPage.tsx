import { privacyUpdatedAt } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { LegalPage } from '@/features/common/components';

export const PrivacyPage = () => {
  const { text } = useLocale();
  return (
    <LegalPage title={text.privacy.title} updatedAt={privacyUpdatedAt} updatedLabel={text.privacy.updated} sections={text.privacy.sections} />
  );
};
