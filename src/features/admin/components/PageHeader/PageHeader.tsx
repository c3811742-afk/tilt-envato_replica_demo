import { Text } from '@/shared/components';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { pageHeaderDefaults } from './PageHeader.defaults';
import type { PageHeaderProps } from './PageHeader.types';
import styles from './PageHeader.module.css';

// Page title, short description and page-level actions.
export const PageHeader = (props: PageHeaderProps) => {
  const { title, description, actions, titleVariant, autoDirection } = withDefaults(pageHeaderDefaults, props);

  return (
    <header className={styles.pageHeader}>
      <div className={styles.text}>
        <Text as="h1" variant={titleVariant} autoDirection={autoDirection}>
          {title}
        </Text>
        {description && <Text color={vars.colors.textMuted}>{description}</Text>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
};
