import type { CSSProperties } from 'react';
import { Button } from '../Button';
import { Text } from '../Text';
import { useLocale } from '@/shared/hooks';
import { withDefaults } from '@/shared/utils';
import { noticeDefaults, noticeTones } from './Notice.defaults';
import type { NoticeProps } from './Notice.types';
import styles from './Notice.module.css';

// A one-line message after an action: success, warning or error.
export const Notice = (props: NoticeProps) => {
  const { children, tone, onDismiss } = withDefaults(noticeDefaults, props);
  const { text } = useLocale();
  const colors = noticeTones[tone];

  const style = {
    '--notice-background': colors.background,
    '--notice-color': colors.color,
  } as CSSProperties;

  return (
    <div className={styles.notice} style={style} role={tone === 'danger' ? 'alert' : 'status'}>
      <Text color={colors.color}>{children}</Text>
      {onDismiss && (
        <Button variant="secondary" size="sm" onClick={onDismiss}>
          {text.common.close}
        </Button>
      )}
    </div>
  );
};
