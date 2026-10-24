import { AsyncContent, Card, Grid, Icon, Page, Stack, Text } from '@/shared/components';
import { searchPath } from '@/shared/constants';
import { useCategories, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatNumber } from '@/shared/utils';

export const CategoriesPage = () => {
  const { text, locale } = useLocale();
  const categories = useCategories();

  return (
    <Page title={text.categoriesPage.title} subtitle={text.categoriesPage.subtitle}>
      <AsyncContent state={categories}>
        {(data) => (
          <Grid>
            {data.map((category) => {
              const colors = vars.accentPairs[category.accent];
              return (
                <Card key={category.id} as="li" to={searchPath({ category: category.id })} background={colors.bg} color={colors.text}>
                  <Icon name={category.icon} size={vars.sizes.icon.xl} />
                  <Text as="h2" variant="h3" color={colors.text}>
                    {text.categories[category.id].name}
                  </Text>
                  <Stack grow>
                    <Text variant="bodySm" color={colors.text}>
                      {text.categories[category.id].description}
                    </Text>
                  </Stack>
                  <Stack direction="row" align="center" justify="space-between" gap={vars.spacing[2]}>
                    <Text as="span" variant="label" color={colors.text}>
                      {fillText(text.categoriesPage.itemCount, { count: formatNumber(category.itemCount, locale) })}
                    </Text>
                    <Icon name="arrowEnd" size={vars.sizes.icon.sm} />
                  </Stack>
                </Card>
              );
            })}
          </Grid>
        )}
      </AsyncContent>
    </Page>
  );
};
