import type { CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { avatarDefaults, avatarFontSizes } from './Avatar.defaults';
import type { AvatarProps } from './Avatar.types';
import styles from './Avatar.module.css';

const initialsCount = 2;

// A creator's initials on their accent color ("Nile Motion" -> "NM"). Decorative: the name is shown next to it.
export const Avatar = (props: AvatarProps) => {
  const { name, accent, size } = withDefaults(avatarDefaults, props);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, initialsCount)
    .map((word) => word[0].toUpperCase())
    .join('');
  const colors = vars.accentPairs[accent];
  const style = {
    '--avatar-size': vars.sizes.avatar[size],
    '--avatar-font-size': avatarFontSizes[size],
    '--avatar-background': colors.bg,
    '--avatar-color': colors.text,
  } as CSSProperties;

  return (
    <span className={styles.avatar} style={style} aria-hidden="true">
      {initials}
    </span>
  );
};
