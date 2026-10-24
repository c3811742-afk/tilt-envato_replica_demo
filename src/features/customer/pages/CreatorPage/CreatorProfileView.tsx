import { AsyncContent, Avatar, BackLink, ItemGrid, Section, Stack, stateMessageHeights, Text } from '@/shared/components';
import { useLocale, usePagedAsync } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { CreatorProfile, Item } from '@/shared/types';
import { api, fillText, formatCompactNumber, formatCountry, formatDate, formatNumber } from '@/shared/utils';
import { FollowButton, LoadMore } from '@/features/customer/components';
import styles from './CreatorPage.module.css';

// A creator's public profile: who they are, then their portfolio (loaded as the user scrolls).
export const CreatorProfileView = ({ profile }: { profile: CreatorProfile }) => {
  const { text, locale } = useLocale();
  const { creator, itemCount, downloads } = profile;
  const portfolio = usePagedAsync<Item>((offset) => api.getCreatorItems(creator.id, { offset }), [creator.id]);

  return (
    <div className={styles.page}>
      <Stack gap={vars.spacing[7]}>
        <BackLink />
        <Stack direction="row" wrap align="center" gap={vars.spacing[5]}>
          <Avatar name={creator.name} accent={creator.accent} size="xl" />
          <Stack gap={vars.spacing[2]}>
            <Text as="h1" variant="h1">
              {creator.name}
            </Text>
            <Text color={vars.colors.textMuted}>
              {fillText(text.creatorPage.location, { city: creator.city[locale], country: formatCountry(creator.country, locale) })}
            </Text>
            <Stack direction="row" wrap gap={vars.spacing[4]}>
              <Text as="span" variant="label">
                {fillText(text.creatorPage.itemCount, { count: formatNumber(itemCount, locale) })}
              </Text>
              <Text as="span" variant="label">
                {fillText(text.creatorPage.downloads, { count: formatCompactNumber(downloads, locale) })}
              </Text>
              <Text as="span" variant="label" color={vars.colors.textMuted}>
                {fillText(text.creatorPage.memberSince, { date: formatDate(creator.joinedAt, locale, { month: 'long', year: 'numeric' }) })}
              </Text>
            </Stack>
            <FollowButton creator={creator} />
          </Stack>
        </Stack>
        <div className={styles.bio}>
          <Text>{creator.bio[locale]}</Text>
        </div>

        <Section title={text.creatorPage.portfolio}>
          <AsyncContent state={portfolio.state} minHeight={stateMessageHeights.compact}>
            {(page) => (
              <Stack gap={vars.spacing[6]}>
                <ItemGrid items={page.items} label={text.creatorPage.portfolio} />
                <LoadMore {...portfolio} />
              </Stack>
            )}
          </AsyncContent>
        </Section>
      </Stack>
    </div>
  );
};
