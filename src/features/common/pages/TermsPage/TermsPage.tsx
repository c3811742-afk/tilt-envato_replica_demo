import { useLocale } from '@/shared/hooks';
import { legalPage } from '@/shared/utils';
import { LegalPage } from '@/features/common/components';

export const TermsPage = () => {
  const { text, locale } = useLocale();
  const { updatedAt, sections } = legalPage('terms', locale);
  return <LegalPage title={text.terms.title} updatedAt={updatedAt} updatedLabel={text.terms.updated} sections={sections} />;
};
