import type { CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { BackLink } from '../BackLink';
import { Container } from '../Container';
import { SectionHeader } from '../SectionHeader';
import { Stack } from '../Stack';
import { pageDefaults } from './Page.defaults';
import type { PageProps } from './Page.types';
import styles from './Page.module.css';

// The standard page: centered content, "‹ Back", the page title as <h1>, then the page's sections.
export const Page = (props: PageProps) => {
  const { children, title, subtitle, headerContent, gap, contentMaxWidth, centered, showBack, backTo, backLabel } = withDefaults(pageDefaults, props);

  const style = { '--page-content-max-width': contentMaxWidth } as CSSProperties;

  return (
    <Container>
      <div className={cx(styles.page, centered && styles.centered)} style={style}>
        <Stack gap={gap}>
          {/* Back sits close to the title, whatever the space between the page's sections. */}
          {(showBack || title) && (
            <Stack gap={vars.spacing[3]}>
              {showBack && <BackLink to={backTo} label={backLabel} />}
              {title && (
                <SectionHeader as="h1" variant="h1" title={title} subtitle={subtitle}>
                  {headerContent}
                </SectionHeader>
              )}
            </Stack>
          )}
          {children}
        </Stack>
      </div>
    </Container>
  );
};
