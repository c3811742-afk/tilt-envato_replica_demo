import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { TextLink } from '../TextLink';
import { sectionHeaderDefaults } from './SectionHeader.defaults';
import type { SectionHeaderProps } from './SectionHeader.types';
import styles from './SectionHeader.module.css';

// The heading at the top of a page or section, with an optional "View all" link at the end.
export const SectionHeader = (props: SectionHeaderProps) => {
  const { title, subtitle, as, variant, actionLabel, actionTo, children, actions, autoDirection } = withDefaults(sectionHeaderDefaults, props);

  return (
    <div className={styles.header}>
      <div className={styles.text}>
        {title && (
          <Text as={as} variant={variant} autoDirection={autoDirection}>
            {title}
          </Text>
        )}
        {subtitle && <Text color={vars.colors.textMuted}>{subtitle}</Text>}
        {children}
      </div>
      {actionLabel && actionTo && (
        <TextLink to={actionTo} variant="title">
          {actionLabel}
          <Icon name="arrowEnd" size={vars.sizes.icon.sm} />
        </TextLink>
      )}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
};
