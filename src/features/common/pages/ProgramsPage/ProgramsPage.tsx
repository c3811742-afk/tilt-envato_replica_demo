import { useState } from 'react';
import { Button, Card, EmailField, FormFooter, Grid, Icon, IconNote, Page, Section, Select, SplitLayout, Stack, Text, TextField } from '@/shared/components';
import { partnerAudiences, partnerPrograms, routes, type PartnerAudience, type PartnerProgram } from '@/shared/constants';
import { useForm, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { currentPrograms, fillText, formatDate, formatNumber, resourcesApi, validateEmail, validateRequired } from '@/shared/utils';

// "Author portal": how to become an author, the way into the creator application, and ways to sign in or get help.
export const AuthorsPage = () => {
  const { text, locale } = useLocale();
  const programs = currentPrograms();

  return (
    <Page title={text.authors.title} subtitle={text.authors.subtitle} gap={vars.spacing[7]}>
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
      <SplitLayout
        main={
          <Section title={text.authors.formTitle} variant="h3" gap={vars.spacing[4]}>
            {/* The full creator application (Laila's onboarding): work, agreement, ID, payout and profile. */}
            <Text color={vars.colors.textMuted}>{text.authors.applyText}</Text>
            <div>
              <Button to={routes.creatorOnboarding}>{text.authors.startApplication}</Button>
            </div>
          </Section>
        }
        aside={
          <Stack gap={vars.spacing[4]}>
            <Card gap={vars.spacing[3]}>
              <Text as="h2" variant="h4">
                {text.authors.signInTitle}
              </Text>
              <Text color={vars.colors.textMuted}>{text.authors.signInText}</Text>
              <div>
                <Button variant="outline" to={routes.signIn}>
                  {text.common.signIn}
                </Button>
              </div>
            </Card>
            <Card gap={vars.spacing[3]}>
              <Text as="h2" variant="h4">
                {text.authors.helpTitle}
              </Text>
              <Text color={vars.colors.textMuted}>{text.authors.helpText}</Text>
              <Stack direction="row" wrap gap={vars.spacing[2]}>
                <Button variant="outline" to={routes.help}>
                  {text.nav.help}
                </Button>
                <Button variant="outline" to={routes.support}>
                  {text.nav.support}
                </Button>
              </Stack>
            </Card>
          </Stack>
        }
      />
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
