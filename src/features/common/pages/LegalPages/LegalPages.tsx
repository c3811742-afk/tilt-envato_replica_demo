import { fairUseUpdatedAt, licenseTermsUpdatedAt } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { LegalPage } from '@/features/common/components';

// "License terms": what every license allows. Open to everyone.
export const LicenseTermsPage = () => {
  const { text } = useLocale();
  return <LegalPage title={text.licenseTerms.title} updatedAt={licenseTermsUpdatedAt} updatedLabel={text.licenseTerms.updated} sections={text.licenseTerms.sections} />;
};

// "Fair use policy": how plans may be used. Open to everyone.
export const FairUsePage = () => {
  const { text } = useLocale();
  return <LegalPage title={text.fairUse.title} updatedAt={fairUseUpdatedAt} updatedLabel={text.fairUse.updated} sections={text.fairUse.sections} />;
};
