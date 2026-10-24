import { withDefaults } from '@/shared/utils';
import { SectionHeader } from '../SectionHeader';
import { Stack } from '../Stack';
import { sectionDefaults } from './Section.defaults';
import type { SectionProps } from './Section.types';

// A titled block of a page: the header (with an optional "View all" link), then its content.
export const Section = (props: SectionProps) => {
  const { children, gap, ariaLabel, title, subtitle, as, variant, actionLabel, actionTo } = withDefaults(
    sectionDefaults,
    props,
  );

  return (
    <Stack as="section" gap={gap} ariaLabel={ariaLabel}>
      {title && (
        <SectionHeader title={title} subtitle={subtitle} as={as} variant={variant} actionLabel={actionLabel} actionTo={actionTo} />
      )}
      {children}
    </Stack>
  );
};
