import { useId, type CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { accordionDefaults } from './Accordion.defaults';
import type { AccordionProps } from './Accordion.types';
import styles from './Accordion.module.css';

// Expandable questions and answers, built on <details> so it works with the keyboard and screen readers.
export const Accordion = (props: AccordionProps) => {
  const { items, exclusive, defaultOpenId, borderColor } = withDefaults(accordionDefaults, props);
  const groupName = useId();

  const style = { '--accordion-border-color': borderColor } as CSSProperties;

  return (
    <div className={styles.accordion} style={style}>
      {items.map((item) => (
        <details key={item.id} className={styles.item} name={exclusive ? groupName : undefined} open={item.id === defaultOpenId}>
          <summary className={styles.summary}>
            <Text as="span" variant="title">
              {item.title}
            </Text>
            <span className={styles.chevron}>
              <Icon name="chevronDown" size={vars.sizes.icon.sm} />
            </span>
          </summary>
          <div className={styles.content}>{item.content}</div>
        </details>
      ))}
    </div>
  );
};
