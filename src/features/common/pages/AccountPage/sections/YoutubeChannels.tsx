import { useState } from 'react';
import { Button, Card, FieldMessage, Icon, Section, Stack, Text, TextField } from '@/shared/components';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { YoutubeChannel } from '@/shared/types';
import { libraryApi, safeAsync, type SessionAccount } from '@/shared/utils';

// "Add my YouTube channel": music licensed here is cleared on these channels (and named in proof-of-license letters).
export const YoutubeChannels = ({ channels }: { channels: YoutubeChannel[] }) => {
  const { text } = useLocale();
  const { setAccount } = useSession();
  const { requestError } = useMessages();
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const run = async (action: () => Promise<SessionAccount>) => {
    setBusy(true);
    const result = await safeAsync(action);
    setBusy(false);
    setError(result.ok ? undefined : requestError(result.error));
    if (result.ok) setAccount(result.data);
    return result.ok;
  };

  const add = async () => {
    if (await run(() => libraryApi.addYoutubeChannel(url))) setUrl('');
  };

  return (
    <Section title={text.youtube.title} subtitle={text.youtube.intro} variant="h3" gap={vars.spacing[3]}>
      {channels.length === 0 ? (
        <Text color={vars.colors.textMuted}>{text.youtube.empty}</Text>
      ) : (
        <Stack as="ul" gap={vars.spacing[2]}>
          {channels.map((channel) => (
            <Card key={channel.id} as="li" padding={vars.spacing[3]}>
              <Stack direction="row" align="center" justify="space-between" gap={vars.spacing[3]}>
                <Stack direction="row" align="center" gap={vars.spacing[2]}>
                  <Icon name="video" size={vars.sizes.icon.sm} />
                  <Text as="span" variant="title" maxLines={1}>
                    <bdi>{channel.name}</bdi>
                  </Text>
                </Stack>
                <Button variant="outline" size="sm" disabled={busy} onClick={() => void run(() => libraryApi.removeYoutubeChannel(channel.id))}>
                  {text.youtube.remove}
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
      <Stack
        as="form"
        gap={vars.spacing[3]}
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
        noValidate
      >
        <TextField label={text.youtube.label} placeholder={text.youtube.placeholder} direction="ltr" inputMode="text" value={url} onChange={setUrl} />
        <FieldMessage tone="error" message={error} />
        <div>
          <Button type="submit" variant="secondary" disabled={busy || !url.trim()}>
            <Icon name="plus" size={vars.sizes.icon.sm} />
            {text.youtube.add}
          </Button>
        </div>
      </Stack>
    </Section>
  );
};
