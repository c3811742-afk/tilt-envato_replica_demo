import { useState } from 'react';
import { useParams } from 'react-router';
import { AsyncContent, Badge, Button, Card, EmptyState, Grid, Page, SegmentedControl, Stack, Text } from '@/shared/components';
import { courseLevels, coursePath, routes, type CourseLevel } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Course } from '@/shared/types';
import { contentApi, fillText, formatNumber } from '@/shared/utils';

type KindFilter = 'all' | Course['kind'];
type LevelFilter = 'all' | CourseLevel;
const kinds: KindFilter[] = ['all', 'course', 'tutorial'];
const levels: LevelFilter[] = ['all', ...courseLevels];

const totalMinutes = (course: Course) => course.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

// "Courses and tutorials": filtered by kind and level. Open to everyone.
export const CoursesPage = () => {
  const { text, locale } = useLocale();
  const courses = useAsync(contentApi.getCourses, []);
  const [kind, setKind] = useState<KindFilter>('all');
  const [level, setLevel] = useState<LevelFilter>('all');

  return (
    <Page title={text.courses.title} subtitle={text.courses.subtitle}>
      <Stack direction="row" wrap gap={vars.spacing[3]}>
        <SegmentedControl<KindFilter>
          label={text.courses.kindLabel}
          value={kind}
          onChange={setKind}
          options={kinds.map((option) => ({ value: option, label: option === 'all' ? text.courses.all : text.courses.kinds[option] }))}
        />
        <SegmentedControl<LevelFilter>
          label={text.courses.levelLabel}
          value={level}
          onChange={setLevel}
          options={levels.map((option) => ({ value: option, label: option === 'all' ? text.courses.all : text.courses.levels[option] }))}
        />
      </Stack>
      <AsyncContent state={courses}>
        {(data) => {
          const shown = data.filter((course) => (kind === 'all' || course.kind === kind) && (level === 'all' || course.level === level));
          return shown.length === 0 ? (
            <Text color={vars.colors.textMuted}>{text.courses.empty}</Text>
          ) : (
            <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.courses.title}>
              {shown.map((course) => (
                <li key={course.id}>
                  <Card to={coursePath(course.id)} gap={vars.spacing[3]}>
                    <Stack direction="row" wrap gap={vars.spacing[2]}>
                      <Badge variant={course.kind === 'course' ? 'info' : 'highlight'}>{text.courses.kinds[course.kind]}</Badge>
                      <Badge variant="neutral">{text.courses.levels[course.level]}</Badge>
                    </Stack>
                    <Text as="h2" variant="h4">
                      {course.title[locale]}
                    </Text>
                    <Text color={vars.colors.textMuted}>{course.summary[locale]}</Text>
                    <Text variant="bodySm" color={vars.colors.textMuted}>
                      {fillText(text.courses.lessonCount, { count: formatNumber(course.lessons.length, locale) })} ·{' '}
                      {fillText(text.courses.minutes, { count: formatNumber(totalMinutes(course), locale) })}
                    </Text>
                  </Card>
                </li>
              ))}
            </Grid>
          );
        }}
      </AsyncContent>
    </Page>
  );
};

// One course or tutorial: who teaches it and its lessons.
export const CoursePage = () => {
  const { text, locale } = useLocale();
  const { id = '' } = useParams();
  const course = useAsync(() => contentApi.getCourse(id), [id], (data) => data === null);

  return (
    <Page contentMaxWidth={vars.sizes.readable.maxWidth} backTo={routes.courses} backLabel={text.courses.back}>
      <AsyncContent
        state={course}
        empty={<EmptyState title={text.courses.notFoundTitle} message={text.courses.notFoundMessage} action={<Button to={routes.courses}>{text.courses.back}</Button>} />}
      >
        {(data) =>
          data && (
            <Stack gap={vars.spacing[5]}>
              <Stack gap={vars.spacing[2]}>
                <Stack direction="row" wrap gap={vars.spacing[2]}>
                  <Badge variant="info">{text.courses.kinds[data.kind]}</Badge>
                  <Badge variant="neutral">{text.courses.levels[data.level]}</Badge>
                </Stack>
                <Text as="h1" variant="h1">
                  {data.title[locale]}
                </Text>
                <Text color={vars.colors.textMuted}>{data.summary[locale]}</Text>
                <Text variant="bodySm">{fillText(text.courses.instructor, { name: data.instructor })}</Text>
              </Stack>
              <Text as="h2" variant="h4">
                {text.courses.lessonsTitle}
              </Text>
              <Stack as="ol" gap={vars.spacing[2]}>
                {data.lessons.map((lesson, index) => (
                  <Card key={lesson.title.en} as="li" padding={vars.spacing[4]}>
                    <Stack direction="row" align="center" justify="space-between" gap={vars.spacing[3]}>
                      <Stack direction="row" align="center" gap={vars.spacing[3]}>
                        <Text as="span" variant="h4" color={vars.colors.primary}>
                          {formatNumber(index + 1, locale)}
                        </Text>
                        <Text>{lesson.title[locale]}</Text>
                      </Stack>
                      <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                        {fillText(text.courses.minutes, { count: formatNumber(lesson.minutes, locale) })}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )
        }
      </AsyncContent>
    </Page>
  );
};
