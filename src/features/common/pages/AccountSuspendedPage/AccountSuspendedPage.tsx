import { Button, Card, FormFooter, IconNote, Page, Section, Stack, Text, TextField } from '@/shared/components';
import { routes, supportLimits } from '@/shared/constants';
import { useForm, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, supportApi, validateMessage } from '@/shared/utils';

// "Why was my account suspended, and how do I appeal?" Suspended users are sent here instead of their account pages.
export const AccountSuspendedPage = () => {
  const { text, locale } = useLocale();
  const { session, setAccount } = useSession();
  const form = useForm({ message: '' }, { message: validateMessage });
  const suspension = session.status === 'signedIn' ? session.user.suspension : null;
  if (!suspension) return null; // the onboarding gate only shows this page to suspended accounts

  const submit = form.submit(async ({ message }) => setAccount(await supportApi.appeal(message)));

  return (
    <Page title={text.suspended.title} subtitle={fillText(text.suspended.since, { date: formatDate(suspension.at, locale) })} contentMaxWidth={vars.sizes.readable.maxWidth}>
      <Card gap={vars.spacing[3]}>
        <Text as="h2" variant="h4">
          {text.suspended.reasonTitle}
        </Text>
        <Text>{text.suspended.reasons[suspension.reason]}</Text>
        <Text color={vars.colors.textMuted}>{text.suspended.meaning}</Text>
      </Card>
      <Section title={text.suspended.appealTitle} subtitle={text.suspended.appealText} variant="h3" gap={vars.spacing[3]}>
        {suspension.appeal ? (
          <IconNote icon="clock" text={fillText(text.suspended.underReview, { date: formatDate(suspension.appeal.at, locale) })} />
        ) : (
          <Stack as="form" gap={vars.spacing[3]} onSubmit={submit} noValidate>
            <TextField label={text.suspended.appealMessage} rows={5} maxLength={supportLimits.messageMaxLength} {...form.field('message')} />
            <FormFooter label={text.suspended.submit} submitting={form.submitting} requestError={form.requestError} />
          </Stack>
        )}
      </Section>
      <div>
        <Button variant="outline" to={routes.support}>
          {text.nav.support}
        </Button>
      </div>
    </Page>
  );
};
