import { Button, Icon } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { reorderButtonsDefaults } from './ReorderButtons.defaults';
import type { ReorderButtonsProps } from './ReorderButtons.types';
import styles from './ReorderButtons.module.css';

// "Up" and "Down" icon buttons that change an item's place in a list; hovering shows the name.
// Unlike drag and drop, they work with a keyboard and a screen reader.
export const ReorderButtons = (props: ReorderButtonsProps) => {
  const { label, onMove, canMoveUp, canMoveDown, disabled } = withDefaults(reorderButtonsDefaults, props);
  const { text } = useLocale();

  return (
    <div role="group" aria-label={label} className={styles.group}>
      <Button variant="outline" size="sm" iconOnly tooltip={text.admin.common.moveUp} disabled={disabled || !canMoveUp} onClick={() => onMove?.('up')}>
        <Icon name="chevronUp" size={vars.sizes.icon.sm} />
      </Button>
      <Button variant="outline" size="sm" iconOnly tooltip={text.admin.common.moveDown} disabled={disabled || !canMoveDown} onClick={() => onMove?.('down')}>
        <Icon name="chevronDown" size={vars.sizes.icon.sm} />
      </Button>
    </div>
  );
};
