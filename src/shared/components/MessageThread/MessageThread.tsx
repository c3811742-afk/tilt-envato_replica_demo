import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { Card } from '../Card';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { messageThreadDefaults } from './MessageThread.defaults';
import type { ThreadProps } from './MessageThread.types';
import styles from './MessageThread.module.css';

// A conversation with the support team: each message with who wrote it and when. The customer's support page
// and the admin's ticket page show the same messages, so they show them the same way.
export const MessageThread = (props: ThreadProps) => {
  const { messages, framed, label } = withDefaults(messageThreadDefaults, props);

  return (
    <Stack as="ol" gap={framed ? vars.spacing[4] : vars.spacing[2]} ariaLabel={label}>
      {messages.map((message) => {
        const content = (
          <Stack gap={vars.spacing[1]}>
            <Text as="span" variant="label" color={vars.colors.textMuted}>
              {message.heading}
            </Text>
            <Text variant={framed ? 'body' : 'bodySm'} autoDirection>
              {message.body}
            </Text>
          </Stack>
        );
        return framed ? (
          <Card
            key={message.id}
            as="li"
            background={message.fromTeam ? vars.colors.surfaceMuted : vars.colors.surface}
          >
            <div className={cx(message.fromTeam && styles.fromTeam)}>{content}</div>
          </Card>
        ) : (
          <li key={message.id}>{content}</li>
        );
      })}
    </Stack>
  );
};
