import { useLocation } from 'react-router';
import { Button, Modal, Text } from '@/shared/components';
import { routes, withReturnTo } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

interface GuestDownloadDialogProps {
  signedIn: boolean; // signed in without an active plan: no "Sign in" button
  free: boolean; // a free item of the month: any account can download it
  open: boolean;
  onClose: () => void;
}

// Shown when someone who can't download the item taps Download: guests need an account for free items,
// and a subscription for everything else.
export const GuestDownloadDialog = ({ signedIn, free, open, onClose }: GuestDownloadDialogProps) => {
  const { text } = useLocale();
  const { pathname } = useLocation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={free ? text.guestDownload.freeTitle : text.guestDownload.title}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            {text.common.cancel}
          </Button>
          {!signedIn && (
            <Button variant="secondary" to={withReturnTo(routes.signIn, pathname)}>
              {text.common.signIn}
            </Button>
          )}
          {free ? (
            <Button to={withReturnTo(routes.signUp, pathname)}>{text.common.signUp}</Button>
          ) : (
            <Button to={routes.pricing}>{text.common.viewPlans}</Button>
          )}
        </>
      }
    >
      <Text color={vars.colors.textMuted}>{free ? text.guestDownload.freeMessage : text.guestDownload.message}</Text>
    </Modal>
  );
};
