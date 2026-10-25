import {
  AsyncContent,
  Button,
  Card,
  Chip,
  CollectionCard,
  Container,
  FaqAccordion,
  Grid,
  ReleaseNotesList,
  ScrollRow,
  Section,
  Stack,
  stateMessageHeights,
  Text,
} from '@/shared/components';
import {
  businessIcons,
  businessTypes,
  catalog,
  occasionIcons,
  occasions,
  routes,
  searchPath,
} from '@/shared/constants';
import { useAsync, useCategories, useLocale, useSession, useStoredValue } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { api, currentOccasion, faqGroups, fillText, homepageStore, unreadReleaseNotes } from '@/shared/utils';
import { ChipLinks, HowItWorksSteps, ItemRowSection, SearchBox } from '@/features/customer/components';
import styles from './HomePage.module.css';

export const HomePage = () => {
  const { text, price, locale } = useLocale();
  const { session } = useSession();
  const categories = useCategories();
  const collections = useAsync(api.getCollections, []);
  const plans = useAsync(api.getPlans, []);
  const faqPreview = faqGroups(locale).flatMap((group) => group.items).slice(0, catalog.faqPreviewSize);
  const signedIn = session.status === 'signedIn';
  const occasion = currentOccasion();
  // What the team set up in Admin › Homepage: the rows it feeds load again as soon as it's saved.
  const [homepage] = useStoredValue(homepageStore);

  return (
    <>
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroContent}>
            <Stack gap={vars.spacing[5]}>
              {/* The occasion the team set up for today (admin, homepage settings), e.g. Ramadan. */}
              {occasion && (
                <Text variant="label" color={vars.colors.onPrimary} autoDirection>
                  {occasion.headline[locale]}
                </Text>
              )}
              <Text as="h1" variant="display" color={vars.colors.onPrimary}>
                {text.home.title}
              </Text>
              <Text variant="h4" color={vars.colors.onPrimary}>
                {text.home.subtitle}
              </Text>
              {/* data-tour: the first-login tour points here. */}
              <div data-tour="search">
                <SearchBox size="lg" />
              </div>
              <Stack gap={vars.spacing[2]}>
                <Text as="span" variant="label" color={vars.colors.onPrimary}>
                  {text.search.popularLabel}
                </Text>
                <ScrollRow itemWidth={vars.sizes.chip.rowWidth} gap={vars.spacing[2]} label={text.search.popularLabel}>
                  {text.search.popularTerms.map((term) => (
                    <Chip key={term} to={searchPath({ query: term })}>
                      {term}
                    </Chip>
                  ))}
                </ScrollRow>
              </Stack>
            </Stack>
          </div>
        </Container>
      </section>

      <Container>
        <div className={styles.content}>
          <Stack gap={vars.spacing[8]}>
            <div data-tour="categories">
              <Section title={text.home.categoriesTitle} actionLabel={text.common.viewAll} actionTo={routes.categories}>
                <AsyncContent state={categories} minHeight={stateMessageHeights.compact}>
                  {(data) => (
                    <ChipLinks
                      label={text.home.categoriesTitle}
                      links={data.map((category) => ({
                        key: category.id,
                        label: text.categories[category.id].name,
                        to: searchPath({ category: category.id }),
                        icon: category.icon,
                      }))}
                    />
                  )}
                </AsyncContent>
              </Section>
            </div>

            <ItemRowSection title={text.home.featuredTitle} load={() => api.getFeaturedItems()} deps={[homepage]} />
            <ItemRowSection
              title={text.home.trendingTitle}
              load={() => api.getTrendingItems()}
              actionLabel={text.common.viewAll}
              actionTo={searchPath({ sort: 'popular' })}
            />
            <ItemRowSection
              title={text.home.newTitle}
              load={() => api.getItems('newest')}
              actionLabel={text.common.viewAll}
              actionTo={searchPath({ sort: 'newest' })}
            />
            <ItemRowSection
              title={text.home.freeTitle}
              subtitle={signedIn ? text.home.freeMember : text.home.freeGuest}
              load={() => api.getFreeItems()}
              deps={[homepage]}
              actionLabel={signedIn ? undefined : text.common.signUp}
              actionTo={signedIn ? undefined : routes.signUp}
            />

            <Section title={text.home.occasionsTitle}>
              <ChipLinks
                label={text.home.occasionsTitle}
                links={occasions.map((occasion) => ({
                  key: occasion,
                  label: text.browse.occasions[occasion],
                  to: searchPath({ occasion }),
                  icon: occasionIcons[occasion],
                }))}
              />
            </Section>

            <Section title={text.home.businessTitle}>
              <ChipLinks
                label={text.home.businessTitle}
                links={businessTypes.map((business) => ({
                  key: business,
                  label: text.browse.businesses[business],
                  to: searchPath({ business }),
                  icon: businessIcons[business],
                }))}
              />
            </Section>

            <ItemRowSection
              title={text.home.peoplePlacesTitle}
              load={() => api.getBrowseItems({ spotlight: 'peoplePlaces' })}
              actionLabel={text.common.viewAll}
              actionTo={searchPath({ spotlight: 'peoplePlaces' })}
            />
            <ItemRowSection
              title={text.home.localSoundsTitle}
              load={() => api.getBrowseItems({ spotlight: 'localSounds' })}
              actionLabel={text.common.viewAll}
              actionTo={searchPath({ spotlight: 'localSounds' })}
            />

            <Section title={text.home.collectionsTitle} actionLabel={text.common.viewAll} actionTo={routes.collections}>
              <AsyncContent state={collections} minHeight={stateMessageHeights.compact}>
                {(data) => (
                  <Grid minColumnWidth={vars.sizes.collectionCard.minWidth} ariaLabel={text.home.collectionsTitle}>
                    {data.slice(0, catalog.homeCollections).map((collection) => (
                      <CollectionCard key={collection.id} collection={collection} />
                    ))}
                  </Grid>
                )}
              </AsyncContent>
            </Section>

            <Section title={text.home.howItWorksTitle} actionLabel={text.common.learnMore} actionTo={routes.howItWorks}>
              <HowItWorksSteps />
            </Section>

            <Card
              as="section"
              background={vars.colors.highlight}
              color={vars.colors.onHighlight}
              padding={vars.spacing[6]}
            >
              <Text as="h2" variant="h2" color={vars.colors.onHighlight}>
                {text.home.plansTitle}
              </Text>
              <AsyncContent state={plans} minHeight={stateMessageHeights.compact}>
                {(data) => (
                  <Text variant="h4" color={vars.colors.onHighlight}>
                    {fillText(text.home.plansText, {
                      // Enterprise has no listed price, so it isn't the cheapest.
                      price: price(Math.min(...data.flatMap((plan) => (plan.monthlyPrice === null ? [] : [plan.monthlyPrice])))),
                    })}
                  </Text>
                )}
              </AsyncContent>
              <div>
                <Button variant="secondary" size="lg" to={routes.pricing}>
                  {text.common.viewPlans}
                </Button>
              </div>
            </Card>

            {signedIn && (
              <Section
                title={text.home.whatsNewTitle}
                actionLabel={text.home.whatsNewLink}
                actionTo={routes.notifications}
              >
                <ReleaseNotesList unread={unreadReleaseNotes(session.user).map((note) => note.id)} limit={1} />
              </Section>
            )}

            <Section title={text.home.faqTitle} actionLabel={text.common.viewAll} actionTo={routes.faq}>
              <FaqAccordion entries={faqPreview} />
            </Section>
          </Stack>
        </div>
      </Container>
    </>
  );
};
