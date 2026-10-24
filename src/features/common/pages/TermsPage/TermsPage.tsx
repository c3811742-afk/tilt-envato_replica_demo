import { termsUpdatedAt } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { LegalPage } from '@/features/common/components';

export const TermsPage = () => {
  const { text } = useLocale();
  return <LegalPage title={text.terms.title} updatedAt={termsUpdatedAt} updatedLabel={text.terms.updated} sections={text.terms.sections} />;
};
