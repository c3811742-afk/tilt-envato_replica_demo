import { Text, TextLink } from '@/shared/components';
import { withReturnTo } from '@/shared/constants';
import { useAuthFlow } from '@/shared/hooks';

interface AuthSwitchProps {
  question: string; // e.g. "Don't have an account?"
  linkLabel: string; // e.g. "Sign up"
  to: string; // the other page, e.g. routes.signUp
}

// The line under sign in / sign up that switches to the other one, keeping the page to come back to.
export const AuthSwitch = ({ question, linkLabel, to }: AuthSwitchProps) => {
  const { returnTo } = useAuthFlow();
  return (
    <Text align="center">
      {question} <TextLink to={withReturnTo(to, returnTo)}>{linkLabel}</TextLink>
    </Text>
  );
};
