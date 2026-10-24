import { useState } from 'react';
import { useLocation } from 'react-router';
import { Button, FieldMessage, Icon, Stack, type ButtonSize } from '@/shared/components';
import { routes, withReturnTo } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { libraryApi, safeAsync } from '@/shared/utils';

interface FavoriteButtonProps {
  itemId: string;
  size?: ButtonSize;
  iconOnly?: boolean; // a heart only, e.g. on a card
  subtle?: boolean; // a small borderless heart, for inside a card
  fullWidth?: boolean;
}

// Adds an item to the user's favorites, or removes it. Guests are sent to sign in first.
export const FavoriteButton = ({ itemId, size = 'md', iconOnly = false, subtle = false, fullWidth = false }: FavoriteButtonProps) => {
  const { text } = useLocale();
  const { session, setAccount } = useSession();
  const { pathname, search } = useLocation();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const signedIn = session.status === 'signedIn';
  const favorite = signedIn && session.user.favoriteIds.includes(itemId);
  const label = favorite ? text.favorites.remove : text.favorites.add;

  const toggle = async () => {
    setSaving(true);
    const result = await safeAsync(() => libraryApi.toggleFavorite(itemId));
    setSaving(false);
    setFailed(!result.ok);
    if (result.ok) setAccount(result.data);
  };

  const quiet = subtle ? { variant: 'ghost', size: 'xs', iconOnly: true } as const : { size, iconOnly };
  const content = (
    <>
      <Icon name="heart" size={vars.sizes.icon.sm} filled={favorite} />
      {!quiet.iconOnly && label}
    </>
  );

  if (!signedIn) {
    return (
      <Button variant="outline" {...quiet} fullWidth={fullWidth} to={withReturnTo(routes.signIn, `${pathname}${search}`)} ariaLabel={text.favorites.signIn} tooltip={quiet.iconOnly ? text.favorites.signIn : undefined}>
        {content}
      </Button>
    );
  }

  const button = (
    <Button
      variant={favorite ? 'secondary' : 'outline'}
      {...quiet}
      fullWidth={fullWidth}
      disabled={saving}
      onClick={toggle}
      pressed={favorite}
      ariaLabel={quiet.iconOnly ? label : undefined}
      tooltip={quiet.iconOnly ? label : undefined}
    >
      {content}
    </Button>
  );

  // On a card there's no room for a message: a failed toggle simply leaves the heart as it was.
  if (quiet.iconOnly) return button;
  return (
    <Stack gap={vars.spacing[1]}>
      {button}
      <FieldMessage tone="error" message={failed ? text.favorites.failed : undefined} />
    </Stack>
  );
};
