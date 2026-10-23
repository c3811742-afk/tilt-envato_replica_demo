import { useState } from 'react';
import { Button, Card, EmptyState, FieldMessage, IconNote, Page, Stack, TextLink } from '@/shared/components';
import { routes, withReturnTo } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { demoApi, safeAsync, type SessionAccount } from '@/shared/utils';

type DemoAction = 'renewalSoon' | 'paymentFailed' | 'removeItem' | 'revokeLicense' | 'creatorPublishes' | 'resetCatalog';

// "Demo controls": events that would happen over time (a renewal coming up, a failed payment, an item
// removed, a license revoked, a followed creator publishing), triggered on demand to see their notifications.
export const DemoPage = () => {
  const { text } = useLocale();
  const { session, setAccount } = useSession();
  const { requestError } = useMessages();
  const [busy, setBusy] = useState<DemoAction | null>(null);
  const [message, setMessage] = useState<{ tone: 'done' | 'error'; text: string } | null>(null);

  if (session.status !== 'signedIn') {
    return (
      <Page title={text.demo.title} subtitle={text.demo.subtitle}>
        <EmptyState title={text.demo.title} message={text.demo.signIn} action={<Button to={withReturnTo(routes.signIn, routes.demo)}>{text.common.signIn}</Button>} />
      </Page>
    );
  }
  const { user, subscription } = session;
  const latestDownload = user.downloads[0];
  const followed = user.following[0];

  // Each action needs something on the account first (a plan, a download, a creator followed).
  const actions: { key: DemoAction; missing?: string; run: () => Promise<SessionAccount | void> }[] = [
    { key: 'renewalSoon', missing: subscription ? undefined : text.demo.needsPlan, run: demoApi.renewalSoon },
    { key: 'paymentFailed', run: demoApi.paymentFailed },
    { key: 'removeItem', missing: latestDownload ? undefined : text.demo.needsDownload, run: () => demoApi.removeItem(latestDownload.itemId) },
    { key: 'revokeLicense', missing: latestDownload ? undefined : text.demo.needsDownload, run: () => demoApi.revokeLatestLicense('rightsDispute') },
    { key: 'creatorPublishes', missing: followed ? undefined : text.demo.needsFollow, run: () => demoApi.creatorPublishes(followed) },
    { key: 'resetCatalog', run: demoApi.resetCatalog },
  ];

  const trigger = async (action: (typeof actions)[number]) => {
    if (action.missing) {
      setMessage({ tone: 'error', text: action.missing });
      return;
    }
    setBusy(action.key);
    const result = await safeAsync(action.run);
    setBusy(null);
    if (!result.ok) {
      setMessage({ tone: 'error', text: requestError(result.error) });
      return;
    }
    if (result.data) setAccount(result.data);
    setMessage({ tone: 'done', text: text.demo.done });
  };

  return (
    <Page title={text.demo.title} subtitle={text.demo.subtitle} contentMaxWidth={vars.sizes.readable.maxWidth}>
      <Card gap={vars.spacing[3]}>
        <Stack gap={vars.spacing[2]}>
          {actions.map((action) => (
            <Button key={action.key} variant="outline" fullWidth disabled={busy !== null} onClick={() => void trigger(action)}>
              {text.demo[action.key]}
            </Button>
          ))}
        </Stack>
        {message?.tone === 'done' && (
          <Stack gap={vars.spacing[2]}>
            <IconNote icon="check" text={message.text} />
            <TextLink to={routes.notifications} variant="bodySm">
              {text.nav.notifications}
            </TextLink>
          </Stack>
        )}
        <FieldMessage tone="error" message={message?.tone === 'error' ? message.text : undefined} />
      </Card>
    </Page>
  );
};
