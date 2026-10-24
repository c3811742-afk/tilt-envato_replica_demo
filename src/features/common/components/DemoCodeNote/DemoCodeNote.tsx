import { IconNote } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { fillText } from '@/shared/utils';

interface DemoCodeNoteProps {
  code?: string; // nothing is shown without a code
  channel?: 'email' | 'sms'; // how the code would have been sent
}

// Demo only: no email or SMS is sent, so the code the user would have received is shown on the page.
export const DemoCodeNote = ({ code, channel = 'email' }: DemoCodeNoteProps) => {
  const { text } = useLocale();
  if (!code) return null;
  return (
    <IconNote
      icon={channel === 'sms' ? 'phone' : 'mail'}
      text={fillText(channel === 'sms' ? text.auth.demoSms : text.auth.demoCode, { code })}
    />
  );
};
