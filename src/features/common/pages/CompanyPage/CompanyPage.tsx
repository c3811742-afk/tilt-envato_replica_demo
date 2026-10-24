import { AsyncContent, Badge, Button, Card, Chip, Grid, Page, Section, Stack, Text } from '@/shared/components';
import { careersEmail, companyPages, jobTeams, routes, type CompanyPage as CompanyPageKey } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { contentApi, formatDate } from '@/shared/utils';

// The company pages (About, Products, Careers, News), with tabs between them. Open to everyone.
export const CompanyPage = ({ page }: { page: CompanyPageKey }) => {
  const { text } = useLocale();
  const copy = text.company[page];

  return (
    <Page title={copy.title} subtitle={copy.subtitle} gap={vars.spacing[7]}>
      <Stack as="nav" direction="row" wrap gap={vars.spacing[2]} ariaLabel={text.footer.company}>
        {companyPages.map((key) => (
          <Chip key={key} to={routes[key]} selected={key === page}>
            {text.nav[key]}
          </Chip>
        ))}
      </Stack>
      {page === 'about' && <About />}
      {page === 'products' && <Products />}
      {page === 'careers' && <Careers />}
      {page === 'news' && <News />}
    </Page>
  );
};

const About = () => {
  const { text } = useLocale();
  return (
    <Stack gap={vars.spacing[6]}>
      <Stack gap={vars.spacing[3]}>
        {text.company.about.paragraphs.map((paragraph) => (
          <Text key={paragraph}>{paragraph}</Text>
        ))}
      </Stack>
      <Section title={text.company.about.valuesTitle}>
        <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.company.about.valuesTitle}>
          {text.company.about.values.map((value) => (
            <Card key={value.title} as="li" gap={vars.spacing[2]}>
              <Text as="h3" variant="h4">
                {value.title}
              </Text>
              <Text color={vars.colors.textMuted}>{value.text}</Text>
            </Card>
          ))}
        </Grid>
      </Section>
    </Stack>
  );
};

const productLinks = [routes.search, routes.ai, routes.pricing, routes.licenseCheck];

const Products = () => {
  const { text } = useLocale();
  return (
    <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.company.products.title}>
      {text.company.products.list.map((product, index) => (
        <li key={product.title}>
          <Card to={productLinks[index] ?? routes.home} gap={vars.spacing[2]}>
            <Text as="h2" variant="h4">
              {product.title}
            </Text>
            <Text color={vars.colors.textMuted}>{product.text}</Text>
          </Card>
        </li>
      ))}
    </Grid>
  );
};

const Careers = () => {
  const { text, locale } = useLocale();
  const jobs = useAsync(contentApi.getJobs, []);
  return (
    <Section title={text.company.careers.openRoles}>
      <AsyncContent state={jobs} empty={<Text color={vars.colors.textMuted}>{text.company.careers.noRoles}</Text>}>
        {(data) => (
          <Stack gap={vars.spacing[5]}>
            {jobTeams.map((team) => {
              const roles = data.filter((job) => job.team === team);
              return roles.length === 0 ? null : (
                <Stack key={team} gap={vars.spacing[2]}>
                  <Text as="h3" variant="label" color={vars.colors.textMuted}>
                    {text.company.careers.teams[team]}
                  </Text>
                  <Stack as="ul" gap={vars.spacing[2]}>
                    {roles.map((job) => (
                      <Card key={job.id} as="li" gap={vars.spacing[2]} padding={vars.spacing[4]}>
                        <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
                          <Text as="h4" variant="title">
                            {job.title[locale]}
                          </Text>
                          <Stack direction="row" gap={vars.spacing[2]}>
                            <Badge variant="neutral">{job.location[locale]}</Badge>
                            {job.remote && <Badge variant="info">{text.company.careers.remote}</Badge>}
                          </Stack>
                        </Stack>
                        <Text color={vars.colors.textMuted}>{job.summary[locale]}</Text>
                        <div>
                          <Button variant="outline" size="sm" href={`mailto:${careersEmail}?subject=${encodeURIComponent(job.title.en)}`}>
                            {text.company.careers.apply}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </AsyncContent>
    </Section>
  );
};

const News = () => {
  const { locale } = useLocale();
  const news = useAsync(contentApi.getNews, []);
  return (
    <AsyncContent state={news}>
      {(data) => (
        <Stack as="ul" gap={vars.spacing[3]}>
          {data.map((post) => (
            <Card key={post.id} as="li" gap={vars.spacing[2]}>
              <Text variant="bodySm" color={vars.colors.textMuted}>
                {formatDate(post.publishedAt, locale)}
              </Text>
              <Text as="h2" variant="h4">
                {post.title[locale]}
              </Text>
              <Text color={vars.colors.textMuted}>{post.summary[locale]}</Text>
            </Card>
          ))}
        </Stack>
      )}
    </AsyncContent>
  );
};
