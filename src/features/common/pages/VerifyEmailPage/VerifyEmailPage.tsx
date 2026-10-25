import { auth } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { authApi, fillText, formatNumber } from '@/shared/utils';
import { CodeVerification } from '@/features/common/components';

// "A registered user must verify their email".
export const VerifyEmailPage = () => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const email = session.status === 'signedIn' ? session.user.email : '';

  return (
    <CodeVerification
      purpose="verifyEmail"
      title={text.auth.verify.title}
      message={fillText(text.auth.verify.message, { length: formatNumber(auth.codeLength, locale), email })}
      verify={authApi.verifyEmail}
    />
  );
};
