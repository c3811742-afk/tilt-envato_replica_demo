import { Badge, Button, Card, FaqAccordion, Grid, Icon, Page, Section, Stack, Text } from '@/shared/components';
import { aiShortcutIcons, aiShortcuts, aiToolGroupKeys, aiToolGroups, aiToolIcons, aiToolPath, routes } from '@/shared/constants';
import { useLocale, useSession, useStoredValue } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { accountCredits, aiSettingsStore, aiToolAccess, isAiToolOn } from '@/shared/utils';

// "AI hub": open to everyone. A page for each AI tool, grouped, then the AI FAQ and the prompt guides.
export const AiHubPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const hasCredits = session.status === 'signedIn' && accountCredits(session).total > 0;
  useStoredValue(aiSettingsStore); // tools the team turns on or off in the admin show here right away
  const planId = session.status === 'signedIn' ? (session.subscription?.planId ?? null) : null;

  return (
    <Page title={text.ai.title} subtitle={text.ai.subtitle} gap={vars.spacing[8]}>
      <Stack direction="row" wrap gap={vars.spacing[3]}>
        {hasCredits ? (
          <Button to={routes.aiHistory}>
            <Icon name="clock" size={vars.sizes.icon.sm} />
            {text.ai.history}
          </Button>
        ) : (
          <Button to={routes.pricing}>{text.common.viewPlans}</Button>
        )}
        <Button variant="outline" to={routes.aiGuides}>
          <Icon name="help" size={vars.sizes.icon.sm} />
          {text.ai.guides}
        </Button>
      </Stack>

      {aiToolGroupKeys.map((group) => (
        <Section key={group} title={text.ai.groups[group]}>
          <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.ai.groups[group]}>
            {aiToolGroups[group].filter(isAiToolOn).map((tool) => (
              <li key={tool}>
                <Card to={aiToolPath(tool)} gap={vars.spacing[3]}>
                  <Icon name={aiToolIcons[tool]} size={vars.sizes.icon.lg} color={vars.colors.primary} />
                  <Text as="h3" variant="h4">
                    {text.ai.tools[tool].name}
                  </Text>
                  {aiToolAccess(tool, planId) === 'notInPlan' && <Badge>{text.ai.notInPlan}</Badge>}
                  <Text color={vars.colors.textMuted}>{text.ai.tools[tool].description}</Text>
                </Card>
              </li>
            ))}
          </Grid>
        </Section>
      ))}

      {/* One-click edits on an image: they also show on every result, and open here with the image picked. */}
      <Section title={text.ai.shortcutsTitle} subtitle={text.ai.shortcutsText}>
        <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.ai.shortcutsTitle}>
          {aiShortcuts.map((shortcut) => (
            <li key={shortcut}>
              <Card to={aiToolPath(shortcut)} gap={vars.spacing[3]}>
                <Icon name={aiShortcutIcons[shortcut]} size={vars.sizes.icon.lg} color={vars.colors.primary} />
                <Text as="h3" variant="h4">
                  {text.ai.shortcuts[shortcut]}
                </Text>
                <Text color={vars.colors.textMuted}>{text.ai.shortcutDescriptions[shortcut]}</Text>
              </Card>
            </li>
          ))}
        </Grid>
      </Section>

      <Section title={text.ai.faqTitle}>
        <FaqAccordion entries={text.ai.faq} />
      </Section>
    </Page>
  );
};
