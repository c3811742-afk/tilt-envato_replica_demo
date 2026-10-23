import type { CSSProperties } from 'react';
import { withDefaults } from '@/shared/utils';
import { codeBadgeDefaults, codeBadgeSizes } from './CodeBadge.defaults';
import type { CodeBadgeProps } from './CodeBadge.types';
import styles from './CodeBadge.module.css';

// A code the user copies or types elsewhere (license code, Fawry reference). Selected with one click.
export const CodeBadge = (props: CodeBadgeProps) => {
  const { code, size, background, color } = withDefaults(codeBadgeDefaults, props);

  const style = {
    '--code-badge-size': codeBadgeSizes[size],
    '--code-badge-background': background,
    '--code-badge-color': color,
  } as CSSProperties;

  // Codes are Latin letters and digits: always left to right.
  return (
    <span className={styles.code} style={style} dir="ltr">
      {code}
    </span>
  );
};
