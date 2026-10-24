import { useParams, useSearchParams } from 'react-router';
import { AsyncContent, Badge, Button, Card, Chip, EmptyState, Grid, Page, Stack, Text, TextLink } from '@/shared/components';
import { blogPath, blogPostPath, blogTopicParam, blogTopics, routes, type BlogTopic } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { BlogPost } from '@/shared/types';
import { contentApi, fillText, formatDate, formatNumber } from '@/shared/utils';

const isTopic = (value: string | null): value is BlogTopic => value !== null && (blogTopics as readonly string[]).includes(value);

// The blog: posts, newest first, filtered by topic. Open to everyone.
export const BlogPage = () => {
  const { text } = useLocale();
  const [params] = useSearchParams();
  const topic = params.get(blogTopicParam);
  const selected = isTopic(topic) ? topic : null;
  const posts = useAsync(contentApi.getBlogPosts, []);

  return (
    <Page title={text.blog.title} subtitle={text.blog.subtitle}>
      <Stack as="nav" direction="row" wrap gap={vars.spacing[2]} ariaLabel={text.blog.title}>
        <Chip to={blogPath()} selected={!selected}>
          {text.blog.allTopics}
        </Chip>
        {blogTopics.map((key) => (
          <Chip key={key} to={blogPath(key)} selected={selected === key}>
            {text.blog.topics[key]}
          </Chip>
        ))}
      </Stack>
      <AsyncContent state={posts}>
        {(data) => {
          const shown = data.filter((post) => !selected || post.topic === selected);
          return shown.length === 0 ? (
            <Text color={vars.colors.textMuted}>{text.blog.empty}</Text>
          ) : (
            <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.blog.title}>
              {shown.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </Grid>
          );
        }}
      </AsyncContent>
    </Page>
  );
};

const PostCard = ({ post }: { post: BlogPost }) => {
  const { text, locale } = useLocale();
  return (
    <Card to={blogPostPath(post.id)} gap={vars.spacing[3]}>
      <div>
        <Badge variant="info">{text.blog.topics[post.topic]}</Badge>
      </div>
      <Text as="h2" variant="h4">
        {post.title[locale]}
      </Text>
      <Text color={vars.colors.textMuted}>{post.summary[locale]}</Text>
      <Text variant="bodySm" color={vars.colors.textMuted}>
        {formatDate(post.publishedAt, locale)} · {fillText(text.blog.readMinutes, { count: formatNumber(post.readMinutes, locale) })}
      </Text>
    </Card>
  );
};

// One blog post.
export const BlogPostPage = () => {
  const { text, locale } = useLocale();
  const { id = '' } = useParams();
  const post = useAsync(() => contentApi.getBlogPost(id), [id], (data) => data === null);

  return (
    <Page contentMaxWidth={vars.sizes.readable.maxWidth} backTo={routes.blog} backLabel={text.blog.back}>
      <AsyncContent
        state={post}
        empty={<EmptyState title={text.blog.notFoundTitle} message={text.blog.notFoundMessage} action={<Button to={routes.blog}>{text.blog.back}</Button>} />}
      >
        {(data) =>
          data && (
            <Stack gap={vars.spacing[5]}>
              <Stack gap={vars.spacing[2]}>
                <TextLink to={blogPath(data.topic)} variant="label">
                  {text.blog.topics[data.topic]}
                </TextLink>
                <Text as="h1" variant="h1">
                  {data.title[locale]}
                </Text>
                <Text color={vars.colors.textMuted}>
                  {fillText(text.blog.by, { author: data.author })} · {formatDate(data.publishedAt, locale)} ·{' '}
                  {fillText(text.blog.readMinutes, { count: formatNumber(data.readMinutes, locale) })}
                </Text>
              </Stack>
              {data.body[locale].map((paragraph) => (
                <Text key={paragraph}>{paragraph}</Text>
              ))}
            </Stack>
          )
        }
      </AsyncContent>
    </Page>
  );
};
