import { useState } from 'react';
import { Button, Card, EmailField, FormFooter, Grid, Icon, IconNote, Page, Section, Select, Stack, Text, TextField, TextLink } from '@/shared/components';
import { partnerAudiences, partnerPrograms, routes, withReturnTo, type PartnerAudience, type PartnerProgram } from '@/shared/constants';
import { useForm, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { currentPrograms, fillText, formatDate, formatNumber, resourcesApi, validateEmail, validateRequired } from '@/shared/utils';

// "Become a creator": the way in (apply, or sign in), how selling on TILT works, programs, and where to get help.
export const AuthorsPage = () => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const programs = currentPrograms();

  return (
    <Page
      title={text.authors.title}
      subtitle={text.authors.subtitle}
      gap={vars.spacing[7]}
      headerContent={
        // The way in comes first: start the application, or sign in when already a creator.
        <Stack gap={vars.spacing[3]} align="flex-start">
          <Text color={vars.colors.textMuted}>{text.authors.applyText}</Text>
          <Button to={routes.creatorOnboarding}>{text.authors.startApplication}</Button>
          {/* Under the main action, the usual "Already a creator? Sign in" line. Creators sign in with the account
              they applied with and land on their dashboard. */}
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {text.authors.signInTitle}{' '}
            <TextLink to={session.status === 'signedIn' ? routes.creatorDashboard : withReturnTo(routes.signIn, routes.creatorDashboard)} variant="bodySm">
              {session.status === 'signedIn' ? text.authors.goToDashboard : text.common.signIn}
            </TextLink>
          </Text>
        </Stack>
      }
    >
      <Section title={text.authors.stepsTitle}>
        <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.authors.stepsTitle}>
          {text.authors.steps.map((step, index) => (
            <Card key={step} as="li" gap={vars.spacing[2]}>
              <Text as="span" variant="h3" color={vars.colors.primary}>
                {formatNumber(index + 1, locale)}
              </Text>
              <Text>{step}</Text>
            </Card>
          ))}
        </Grid>
      </Section>
      {/* Student programs and competitions the team runs with universities (set up in the admin). */}
      {programs.length > 0 && (
        <Section title={text.authors.programsTitle} subtitle={text.authors.programsText}>
          <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.authors.programsTitle}>
            {programs.map((program) => (
              <Card key={program.id} as="li" gap={vars.spacing[2]}>
                <Text variant="label" color={vars.colors.textMuted}>
                  {text.authors.programKinds[program.kind]}
                </Text>
                <Text as="h3" variant="title" autoDirection>
                  {program.name}
                </Text>
                <Text variant="bodySm" autoDirection>
                  {program.university}
                </Text>
                <Text variant="bodySm" color={vars.colors.textMuted} autoDirection>
                  {program.description}
                </Text>
                <Text variant="bodySm">
                  {fillText(text.authors.programDates, { start: formatDate(program.startDate, locale), end: formatDate(program.endDate, locale) })}
                </Text>
                {program.prize && (
                  <Text variant="bodySm" autoDirection>
                    {fillText(text.authors.programPrize, { prize: program.prize })}
                  </Text>
                )}
              </Card>
            ))}
          </Grid>
        </Section>
      )}
      {/* Help closes the page, across its full width. */}
      <Card gap={vars.spacing[3]}>
        <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[4]}>
          <Stack gap={vars.spacing[1]}>
            <Text as="h2" variant="h4">
              {text.authors.helpTitle}
            </Text>
            <Text color={vars.colors.textMuted}>{text.authors.helpText}</Text>
          </Stack>
          <Stack direction="row" wrap gap={vars.spacing[2]}>
            <Button variant="outline" to={routes.help}>
              {text.nav.help}
            </Button>
            <Button variant="outline" to={routes.support}>
              {text.nav.support}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Page>
  );
};

// "Partner programs": the affiliate and creative partner programs, and the application. Open to everyone.
export const PartnersPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const user = session.status === 'signedIn' ? session.user : null;
  const [reference, setReference] = useState<string>();
  const form = useForm(
    {
      program: partnerPrograms[0] as PartnerProgram,
      name: user?.profile?.fullName ?? user?.name ?? '',
      email: user?.email ?? '',
      website: '',
      audience: partnerAudiences[0] as PartnerAudience,
      message: '',
    },
    { name: validateRequired, email: validateEmail, website: validateRequired },
  );

  const submit = form.submit(async ({ program, ...values }) => setReference(await resourcesApi.apply({ kind: program, ...values })));

  return (
    <Page title={text.partners.title} subtitle={text.partners.subtitle} gap={vars.spacing[7]}>
      <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.partners.title}>
        {partnerPrograms.map((program) => {
          const copy = text.partners.programs[program];
          return (
            <Card key={program} as="li" gap={vars.spacing[3]}>
              <Text as="h2" variant="h3">
                {copy.name}
              </Text>
              <Text color={vars.colors.textMuted}>{copy.text}</Text>
              <Stack as="ul" gap={vars.spacing[2]}>
                {copy.points.map((point) => (
                  <Stack key={point} as="li" direction="row" align="flex-start" gap={vars.spacing[2]}>
                    <Icon name="check" size={vars.sizes.icon.sm} color={vars.colors.primary} />
                    <Text as="span" variant="bodySm">
                      {point}
                    </Text>
                  </Stack>
                ))}
              </Stack>
            </Card>
          );
        })}
      </Grid>
      <Section title={text.partners.formTitle} variant="h3" gap={vars.spacing[4]}>
        {reference ? (
          <IconNote icon="check" text={fillText(text.partners.sent, { reference })} />
        ) : (
          <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
            <Select
              label={text.partners.program}
              value={form.values.program}
              onChange={(value) => form.setValue('program', value as PartnerProgram)}
              options={partnerPrograms.map((program) => ({ value: program, label: text.partners.programs[program].name }))}
            />
            <TextField label={text.partners.name} autoComplete="name" {...form.field('name')} />
            <EmailField label={text.partners.email} autoComplete="email" {...form.field('email')} />
            <TextField label={text.partners.website} direction="ltr" {...form.field('website')} />
            <Select
              label={text.partners.audience}
              value={form.values.audience}
              onChange={(value) => form.setValue('audience', value as PartnerAudience)}
              options={partnerAudiences.map((audience) => ({ value: audience, label: text.partners.audiences[audience] }))}
            />
            <TextField label={text.partners.message} rows={4} {...form.field('message')} />
            <FormFooter label={text.partners.submit} submitting={form.submitting} requestError={form.requestError} />
          </Stack>
        )}
      </Section>
    </Page>
  );
};
