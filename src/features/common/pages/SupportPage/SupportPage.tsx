import { useState } from 'react';
import { Badge, Button, Card, EmptyState, FormFooter, IconNote, MessageThread, Page, Section, Select, SplitLayout, Stack, Text, TextField, TextLink } from '@/shared/components';
import { routes, supportLimits, supportTopics, withReturnTo, type SupportTopic } from '@/shared/constants';
import { useForm, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, supportApi, validateMessage, validateRequired } from '@/shared/utils';

// "Contact support": a request to the support team, and the user's earlier requests with their status.
export const SupportPage = () => {
  const { text, locale } = useLocale();
  const { session, setAccount } = useSession();
  const [sentReference, setSentReference] = useState<string>();
  const form = useForm(
    { topic: supportTopics[0] as SupportTopic, subject: '', message: '' },
    {
      subject: validateRequired,
      message: validateMessage,
    },
  );
  const requests = session.status === 'signedIn' ? session.user.supportRequests : [];
  // Open to suspended accounts too, so they can always reach the team; guests sign in first.
  if (session.status !== 'signedIn') {
    return (
      <Page title={text.support.title} subtitle={text.support.subtitle}>
        <EmptyState title={text.support.title} message={text.support.signIn} action={<Button to={withReturnTo(routes.signIn, routes.support)}>{text.common.signIn}</Button>} />
      </Page>
    );
  }

  const submit = form.submit(async (values) => {
    const account = await supportApi.contact(values);
    setAccount(account);
    setSentReference(account.user.supportRequests[0]?.reference);
    form.setValue('subject', '');
    form.setValue('message', '');
  });


  return (
    <Page title={text.support.title} subtitle={text.support.subtitle}>
      <SplitLayout
        main={
          <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
            <Select
              label={text.support.topic}
              value={form.values.topic}
              onChange={(value) => form.setValue('topic', value as SupportTopic)}
              options={supportTopics.map((topic) => ({ value: topic, label: text.support.topics[topic] }))}
            />
            <TextField label={text.support.subject} maxLength={supportLimits.subjectMaxLength} {...form.field('subject')} />
            <TextField
              label={text.support.message}
              hint={text.support.messageHint}
              rows={6}
              maxLength={supportLimits.messageMaxLength}
              {...form.field('message')}
            />
            {sentReference && <IconNote icon="check" text={fillText(text.support.sent, { reference: sentReference })} />}
            <FormFooter label={text.support.send} submitting={form.submitting} requestError={form.requestError} />
          </Stack>
        }
        aside={
          <Stack gap={vars.spacing[5]}>
            <TextLink to={routes.help}>{text.support.helpLink}</TextLink>
            <Section title={text.support.requestsTitle} variant="h4" gap={vars.spacing[3]}>
              {requests.length === 0 ? (
                <Text color={vars.colors.textMuted}>{text.support.requestsEmpty}</Text>
              ) : (
                <Stack as="ul" gap={vars.spacing[2]}>
                  {requests.map((request) => (
                    <Card key={request.id} as="li" padding={vars.spacing[3]} gap={vars.spacing[1]}>
                      <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
                        <Text variant="title" autoDirection maxLines={1}>
                          {request.subject}
                        </Text>
                        <Badge variant={request.status === 'open' ? 'info' : 'free'}>{text.support.statuses[request.status]}</Badge>
                      </Stack>
                      <Text variant="bodySm" color={vars.colors.textMuted}>
                        <bdi>{request.reference}</bdi> · {text.support.topics[request.topic]} · {formatDate(request.createdAt, locale)}
                      </Text>
                      {request.replies && (
                        <MessageThread
                          framed={false}
                          messages={request.replies.map((reply) => ({
                            id: reply.at,
                            fromTeam: true,
                            body: reply.message,
                            heading: fillText(text.support.replyFrom, { name: reply.by, date: formatDate(reply.at, locale) }),
                          }))}
                        />
                      )}
                    </Card>
                  ))}
                </Stack>
              )}
            </Section>
          </Stack>
        }
      />
    </Page>
  );
};
