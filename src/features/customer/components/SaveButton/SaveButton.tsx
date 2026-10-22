import { useState } from 'react';
import { useLocation } from 'react-router';
import { Button, FieldMessage, Icon, Stack } from '@/shared/components';
import { routes, withReturnTo } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, safeAsync } from '@/shared/utils';

interface SaveButtonProps {
  itemId: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

// Saves an item to the user's saved items, or removes it. Guests are sent to sign in first.
export const SaveButton = ({ itemId, size = 'md', fullWidth = false }: SaveButtonProps) => {
  const { text } = useLocale();
  const { session, setAccount } = useSession();
  const { pathname, search } = useLocation();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  if (session.status !== 'signedIn') {
    return (
      <Button variant="outline" size={size} fullWidth={fullWidth} to={withReturnTo(routes.signIn, `${pathname}${search}`)} ariaLabel={text.item.saveSignIn}>
        <Icon name="bookmark" size={vars.sizes.icon.sm} />
        {text.common.save}
      </Button>
    );
  }

  const saved = session.user.savedItemIds.includes(itemId);
  const toggle = async () => {
    setSaving(true);
    const result = await safeAsync(() => authApi.toggleSaved(itemId));
    setSaving(false);
    setFailed(!result.ok);
    if (result.ok) setAccount(result.data);
  };

  return (
    <Stack gap={vars.spacing[1]}>
      <Button variant={saved ? 'secondary' : 'outline'} size={size} fullWidth={fullWidth} disabled={saving} onClick={toggle} pressed={saved}>
        <Icon name="bookmark" size={vars.sizes.icon.sm} filled={saved} />
        {saved ? text.common.savedItem : text.common.save}
      </Button>
      <FieldMessage tone="error" message={failed ? text.item.saveFailed : undefined} />
    </Stack>
  );
};
