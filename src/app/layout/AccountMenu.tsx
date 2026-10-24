import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge, Button, Divider, Dropdown, FieldMessage, Icon, Stack, Text, TextLink } from '@/shared/components';
import { accountPath, accountSections, routes } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Subscription, User } from '@/shared/types';
import { fillText, formatDate, formatNumber, isSubscriptionActive, unreadCount } from '@/shared/utils';
import styles from './AccountMenu.module.css';

interface AccountMenuProps {
  user: User;
  subscription: Subscription | null;
}

// The signed-in user's menu in the header: who they are, their plan, and "Log out".
export const AccountMenu = ({ user, subscription }: AccountMenuProps) => {
  const { text, locale } = useLocale();
  const { signOut } = useSession();
  const navigate = useNavigate();
  const [signOutFailed, setSignOutFailed] = useState(false);
  const unread = unreadCount(user);

  const planStatus = (() => {
    if (!subscription) return text.auth.noPlan;
    const plan = text.pricing.plans[subscription.planId].name;
    if (subscription.status === 'pendingPayment') return fillText(text.auth.planPending, { plan });
    if (!isSubscriptionActive(subscription)) return text.auth.noPlan;
    return fillText(text.auth.planActive, { plan, date: formatDate(subscription.endsAt, locale) });
  })();

  const logOut = async (close: () => void) => {
    const result = await signOut();
    setSignOutFailed(!result.ok);
    if (!result.ok) return;
    close();
    navigate(routes.home);
  };

  return (
    <Dropdown
      label={text.auth.accountMenu}
      trigger={
        <>
          <Icon name="user" size={vars.sizes.icon.sm} />
          <span className={styles.name} dir="auto">
            {user.name}
          </span>
        </>
      }
    >
      {(close) => (
        <Stack gap={vars.spacing[3]}>
          <Stack gap={vars.spacing[1]}>
            <Text variant="title" autoDirection maxLines={1}>
              {user.name}
            </Text>
            <Text variant="bodySm" color={vars.colors.textMuted} maxLines={1}>
              {user.email}
            </Text>
          </Stack>
          <Text variant="bodySm">{planStatus}</Text>
          {!isSubscriptionActive(subscription) && (
            <TextLink to={routes.pricing} variant="bodySm">
              {text.common.viewPlans}
            </TextLink>
          )}
          <Divider />
          <Stack as="ul" gap={vars.spacing[2]}>
            <li>
              <TextLink to={accountPath(accountSections[0])} variant="bodySm" underline={false}>
                {text.nav.account}
              </TextLink>
            </li>
            <li>
              <TextLink to={accountPath('plan')} variant="bodySm" underline={false}>
                {text.account.sections.plan}
              </TextLink>
            </li>
            <li>
              <TextLink to={routes.downloads} variant="bodySm" underline={false}>
                {text.nav.downloads}
              </TextLink>
            </li>
            <li>
              <TextLink to={routes.favorites} variant="bodySm" underline={false}>
                {text.nav.favorites}
              </TextLink>
            </li>
            <li>
              <TextLink to={routes.myCollections} variant="bodySm" underline={false}>
                {text.nav.myCollections}
              </TextLink>
            </li>
            <li>
              <TextLink to={routes.ai} variant="bodySm" underline={false}>
                {text.nav.ai}
              </TextLink>
            </li>
            <li>
              <TextLink to={routes.team} variant="bodySm" underline={false}>
                {text.nav.team}
              </TextLink>
            </li>
            <li>
              <TextLink to={routes.notifications} variant="bodySm" underline={false}>
                {text.nav.notifications}
                {unread > 0 && <Badge variant="highlight">{formatNumber(unread, locale)}</Badge>}
              </TextLink>
            </li>
          </Stack>
          <Divider />
          <FieldMessage tone="error" message={signOutFailed ? text.auth.logOutFailed : undefined} />
          <Button variant="outline" size="sm" fullWidth onClick={() => logOut(close)}>
            <Icon name="logOut" size={vars.sizes.icon.sm} />
            {text.common.logOut}
          </Button>
        </Stack>
      )}
    </Dropdown>
  );
};
