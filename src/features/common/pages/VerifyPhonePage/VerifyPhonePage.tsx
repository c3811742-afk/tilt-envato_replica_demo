import { auth, phoneCountryCode } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { authApi, fillText, formatNumber } from '@/shared/utils';
import { CodeVerification } from '@/features/common/components';

// "A registered user must verify their phone number with a code": after the profile step, or after changing the number.
export const VerifyPhonePage = () => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const national = session.status === 'signedIn' ? (session.user.profile?.phone ?? '') : '';
  // 01012345678 -> +20 1012345678
  const phone = `${phoneCountryCode} ${national.replace(/^0/, '')}`;

  return (
    <CodeVerification
      purpose="verifyPhone"
      title={text.auth.verifyPhone.title}
      message={fillText(text.auth.verifyPhone.message, { length: formatNumber(auth.codeLength, locale), phone })}
      verify={authApi.verifyPhone}
    />
  );
};
