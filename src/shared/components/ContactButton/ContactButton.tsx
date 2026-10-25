import { contact } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { contactButtonDefaults } from './ContactButton.defaults';
import type { ContactButtonProps } from './ContactButton.types';

// Opens a WhatsApp chat with support, the contact channel Egyptian users expect.
export const ContactButton = (props: ContactButtonProps) => {
  const { variant, size, label } = withDefaults(contactButtonDefaults, props);
  const { text } = useLocale();

  return (
    <Button variant={variant} size={size} href={contact.whatsappUrl}>
      <Icon name="message" size={vars.sizes.icon.sm} />
      {label ?? text.common.contactWhatsapp}
    </Button>
  );
};
