import type { CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { iconNoteDefaults } from './IconNote.defaults';
import type { IconNoteProps } from './IconNote.types';
import styles from './IconNote.module.css';

// A short highlighted note with an icon: a title and one line of explanation (e.g. the license summary).
export const IconNote = (props: IconNoteProps) => {
  const { icon, title, text, background, iconColor, autoDirection } = withDefaults(iconNoteDefaults, props);

  const style = { '--icon-note-background': background } as CSSProperties;

  return (
    <div className={styles.note} style={style}>
      <Icon name={icon} color={iconColor} />
      <Stack gap={vars.spacing[1]}>
        {title && (
          <Text variant="title" autoDirection={autoDirection}>
            {title}
          </Text>
        )}
        {text && (
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {text}
          </Text>
        )}
      </Stack>
    </div>
  );
};
