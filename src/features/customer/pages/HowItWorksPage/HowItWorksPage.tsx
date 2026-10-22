import { AsyncContent, Button, Card, Grid, Icon, Page, Section, stateMessageHeights, Text } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { api, formatNumber } from '@/shared/utils';
import { HowItWorksSteps } from '@/features/customer/components';
import styles from './HowItWorksPage.module.css';

export const HowItWorksPage = () => {
  const { text, locale } = useLocale();
  const stats = useAsync(api.getStats, []);
  const { benefits } = text.howItWorks;

  const benefitList = [
    { icon: 'infinity', ...benefits.unlimited },
    { icon: 'license', ...benefits.license },
    { icon: 'refresh', ...benefits.fresh },
    { icon: 'wallet', ...benefits.local },
  ] as const;

  return (
    <Page title={text.howItWorks.title} subtitle={text.howItWorks.subtitle} gap={vars.spacing[8]}>
      <Section title={text.howItWorks.stepsTitle}>
        <HowItWorksSteps />
      </Section>

      <Section title={text.howItWorks.benefitsTitle}>
        <Grid>
          {benefitList.map((benefit) => (
            <Card key={benefit.title} as="li" gap={vars.spacing[2]}>
              <Icon name={benefit.icon} size={vars.sizes.icon.lg} color={vars.colors.primary} />
              <Text as="h3" variant="h4">
                {benefit.title}
              </Text>
              <Text variant="bodySm" color={vars.colors.textMuted}>
                {benefit.text}
              </Text>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section title={text.howItWorks.statsTitle}>
        <AsyncContent state={stats} minHeight={stateMessageHeights.compact}>
          {(data) => (
            <dl className={styles.stats}>
              {[
                { label: text.howItWorks.stats.items, value: data.itemCount },
                { label: text.howItWorks.stats.creators, value: data.creatorCount },
                { label: text.howItWorks.stats.categories, value: data.categoryCount },
              ].map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <Text as="dt" variant="label" color={vars.colors.onHighlight}>
                    {stat.label}
                  </Text>
                  <Text as="dd" variant="display" color={vars.colors.onHighlight}>
                    {formatNumber(stat.value, locale)}
                  </Text>
                </div>
              ))}
            </dl>
          )}
        </AsyncContent>
      </Section>

      <Card as="section" background={vars.colors.primary} color={vars.colors.onPrimary} padding={vars.spacing[6]}>
        <Icon name="users" size={vars.sizes.icon.xl} />
        <Text as="h2" variant="h2" color={vars.colors.onPrimary}>
          {text.howItWorks.teamsTitle}
        </Text>
        <Text color={vars.colors.onPrimary}>{text.howItWorks.teamsText}</Text>
        <div>
          <Button variant="highlight" size="lg" to={routes.pricing}>
            {text.common.viewPlans}
          </Button>
        </div>
      </Card>
    </Page>
  );
};
