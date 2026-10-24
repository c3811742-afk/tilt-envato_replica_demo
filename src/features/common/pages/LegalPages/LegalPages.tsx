import { fairUseUpdatedAt } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { legalPage } from '@/shared/utils';
import { LegalPage } from '@/features/common/components';

// "License terms": what every license allows. Open to everyone.
export const LicenseTermsPage = () => {
  const { text, locale } = useLocale();
  const { updatedAt, sections } = legalPage('license', locale);
  return <LegalPage title={text.licenseTerms.title} updatedAt={updatedAt} updatedLabel={text.licenseTerms.updated} sections={sections} />;
};

// "Fair use policy": how plans may be used. Open to everyone.
export const FairUsePage = () => {
  const { text } = useLocale();
  return <LegalPage title={text.fairUse.title} updatedAt={fairUseUpdatedAt} updatedLabel={text.fairUse.updated} sections={text.fairUse.sections} />;
};
