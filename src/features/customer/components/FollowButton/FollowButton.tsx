import { useLocation } from 'react-router';
import { Button, FieldMessage, Icon, Stack, Text } from '@/shared/components';
import { routes, withReturnTo } from '@/shared/constants';
import { useAccountAction, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Creator } from '@/shared/types';
import { fillText, libraryApi } from '@/shared/utils';

// "Follow a creator": followers are told when the creator publishes. Guests are sent to sign in first.
export const FollowButton = ({ creator }: { creator: Creator }) => {
  const { text } = useLocale();
  const { session } = useSession();
  const { pathname } = useLocation();
  const { run, busy, error } = useAccountAction();

  if (session.status !== 'signedIn') {
    return (
      <Button variant="outline" to={withReturnTo(routes.signIn, pathname)} ariaLabel={text.follow.signIn}>
        <Icon name="plus" size={vars.sizes.icon.sm} />
        {text.follow.follow}
      </Button>
    );
  }

  const following = session.user.following.includes(creator.id);
  const toggle = () => run(() => libraryApi.toggleFollow(creator.id));

  return (
    <Stack gap={vars.spacing[2]} align="flex-start">
      <Button variant={following ? 'secondary' : 'primary'} pressed={following} disabled={busy} onClick={() => void toggle()}>
        <Icon name={following ? 'check' : 'plus'} size={vars.sizes.icon.sm} />
        {following ? text.follow.following : text.follow.follow}
      </Button>
      {following && (
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {fillText(text.follow.followers, { creator: creator.name })}
        </Text>
      )}
      <FieldMessage tone="error" message={error} />
    </Stack>
  );
};
