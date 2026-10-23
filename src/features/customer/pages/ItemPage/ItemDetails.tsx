import { useState } from 'react';
import {
  Avatar,
  Button,
  Chip,
  Grid,
  Icon,
  IconNote,
  Section,
  SplitLayout,
  Stack,
  Text,
  TextLink,
  TierBadge,
} from '@/shared/components';
import { creatorPath, routes, searchPath } from '@/shared/constants';
import { useCopy, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item } from '@/shared/types';
import { fillText, formatCountry, formatLanguageName, isTranslated } from '@/shared/utils';
import { FavoriteButton, ItemDownload, SaveToCollection } from '@/features/customer/components';
import { ItemFacts } from './ItemFacts';
import { ItemPreview } from './ItemPreview';
import { RelatedItems } from './RelatedItems';
import styles from './ItemPage.module.css';

export const ItemDetails = ({ item }: { item: Item }) => {
  const { text, locale } = useLocale();
  const [showOriginal, setShowOriginal] = useState(false);
  const { status: copyStatus, copy } = useCopy();
  const category = text.categories[item.categoryId];
  const translated = isTranslated(item, locale);
  // Item text is shown in the active language; "Show original" switches to the language the creator wrote it in.
  const textLanguage = translated && showOriginal ? item.originalLanguage : locale;
  const title = item.title[textLanguage];

  return (
    <div className={styles.page}>
      <Stack gap={vars.spacing[7]}>
        <Stack as="nav" direction="row" wrap align="center" gap={vars.spacing[2]} ariaLabel={text.nav.breadcrumb}>
          <TextLink to={routes.home} variant="bodySm">
            {text.nav.home}
          </TextLink>
          <Icon name="chevronEnd" size={vars.sizes.icon.sm} />
          <TextLink to={searchPath({ category: item.categoryId })} variant="bodySm">
            {category.name}
          </TextLink>
        </Stack>

        <SplitLayout
          main={
            <Stack gap={vars.spacing[5]}>
              <div data-tour="preview">
                <ItemPreview item={item} title={title} />
              </div>
              <Section title={text.item.about} variant="h3" gap={vars.spacing[2]}>
                <Text autoDirection>{item.description[textLanguage]}</Text>
                {item.imageCredit && (
                  <Text variant="bodySm" color={vars.colors.textMuted}>
                    {fillText(text.item.imageCredit, { author: item.imageCredit.author, license: item.imageCredit.license })}{' '}
                    <TextLink href={item.imageCredit.sourceUrl} variant="bodySm">
                      {fillText(text.item.viewSource, { source: item.imageCredit.sourceName })}
                    </TextLink>
                  </Text>
                )}
              </Section>
            </Stack>
          }
          aside={
            <Stack gap={vars.spacing[5]}>
              <Stack gap={vars.spacing[2]} align="flex-start">
                <TierBadge tier={item.tier} />
                <Text as="h1" variant="h2" autoDirection>
                  {title}
                </Text>
                {translated && (
                  <Stack direction="row" wrap align="center" gap={vars.spacing[2]}>
                    <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                      {fillText(text.item.translatedFrom, { language: formatLanguageName(item.originalLanguage, locale) })}
                    </Text>
                    <TextLink variant="bodySm" onClick={() => setShowOriginal(!showOriginal)}>
                      {showOriginal ? text.item.showTranslation : text.item.showOriginal}
                    </TextLink>
                  </Stack>
                )}
              </Stack>

              <Stack direction="row" align="center" gap={vars.spacing[3]}>
                <Avatar name={item.creator.name} accent={item.creator.accent} />
                <Stack gap={vars.spacing[0]}>
                  <TextLink to={creatorPath(item.creator.id)} variant="title" underline={false}>
                    {item.creator.name}
                  </TextLink>
                  <Text variant="bodySm" color={vars.colors.textMuted}>
                    {fillText(text.creatorPage.location, {
                      city: item.creator.city[locale],
                      country: formatCountry(item.creator.country, locale),
                    })}
                  </Text>
                </Stack>
              </Stack>

              <Stack gap={vars.spacing[3]}>
                <ItemDownload
                  item={item}
                  trigger={(open) => (
                    <div data-tour="download">
                      <Button size="lg" fullWidth onClick={open}>
                        <Icon name="download" />
                        {item.tier === 'free' ? text.item.freeThisMonth : text.item.download}
                      </Button>
                    </div>
                  )}
                />
                <Grid as="div" columns={2} gap={vars.spacing[3]}>
                  <FavoriteButton itemId={item.id} fullWidth />
                  <SaveToCollection itemId={item.id} fullWidth />
                </Grid>
                <Button variant="outline" fullWidth onClick={() => copy(window.location.href)}>
                  <Icon name={copyStatus === 'copied' ? 'check' : 'link'} size={vars.sizes.icon.sm} />
                  {copyStatus === 'copied' ? text.common.linkCopied : text.common.copyLink}
                </Button>
                {copyStatus === 'failed' && (
                  <Text variant="bodySm" color={vars.colors.danger}>
                    {text.common.copyFailed}
                  </Text>
                )}
              </Stack>

              <IconNote icon="license" title={text.item.license} text={text.item.licenseSummary} />

              <Section title={text.item.details} variant="h4" gap={vars.spacing[2]}>
                <ItemFacts item={item} />
              </Section>

              {item.tags.length > 0 && (
                <Section title={text.item.tags} variant="h4" gap={vars.spacing[2]}>
                  <Stack direction="row" wrap gap={vars.spacing[2]}>
                    {item.tags.map((tag) => (
                      <Chip key={tag} to={searchPath({ query: tag })}>
                        <span dir="auto">{tag}</span>
                      </Chip>
                    ))}
                  </Stack>
                </Section>
              )}
            </Stack>
          }
        />

        <RelatedItems item={item} />
      </Stack>
    </div>
  );
};
