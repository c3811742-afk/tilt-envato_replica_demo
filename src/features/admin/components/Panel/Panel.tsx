import { useId, type CSSProperties } from 'react';
import { Text } from '@/shared/components';
import { withDefaults } from '@/shared/utils';
import { panelDefaults } from './Panel.defaults';
import type { PanelProps } from './Panel.types';
import styles from './Panel.module.css';

// A bordered box that groups related content under an optional heading.
export const Panel = (props: PanelProps) => {
  const { children, title, as: Element, padding, background, borderColor } = withDefaults(panelDefaults, props);
  const titleId = useId();

  const style = {
    '--panel-padding': padding,
    '--panel-background': background,
    '--panel-border-color': borderColor,
  } as CSSProperties;

  return (
    <Element className={styles.panel} style={style} aria-labelledby={title ? titleId : undefined}>
      {title && (
        <div id={titleId}>
          <Text as="h2" variant="h4">
            {title}
          </Text>
        </div>
      )}
      {children}
    </Element>
  );
};
