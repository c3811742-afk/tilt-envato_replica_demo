import { Button } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { withDefaults } from '@/shared/utils';
import { reorderButtonsDefaults } from './ReorderButtons.defaults';
import type { ReorderButtonsProps } from './ReorderButtons.types';
import styles from './ReorderButtons.module.css';

// "Up" and "Down" buttons that change an item's place in a list.
// Unlike drag and drop, they work with a keyboard and a screen reader.
export const ReorderButtons = (props: ReorderButtonsProps) => {
  const { label, onMove, canMoveUp, canMoveDown, disabled } = withDefaults(reorderButtonsDefaults, props);
  const { text } = useLocale();

  return (
    <div role="group" aria-label={label} className={styles.group}>
      <Button variant="muted" size="sm" disabled={disabled || !canMoveUp} onClick={() => onMove?.('up')}>
        {text.admin.common.moveUp}
      </Button>
      <Button variant="muted" size="sm" disabled={disabled || !canMoveDown} onClick={() => onMove?.('down')}>
        {text.admin.common.moveDown}
      </Button>
    </div>
  );
};
