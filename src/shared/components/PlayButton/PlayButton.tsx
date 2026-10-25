import type { CSSProperties } from 'react';
import { withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { Spinner } from '../Spinner';
import { playButtonDefaults, playButtonSizes, playButtonVariants } from './PlayButton.defaults';
import type { PlayButtonProps } from './PlayButton.types';
import styles from './PlayButton.module.css';

// The round play / pause button of every preview (cards, track lists, the media player).
export const PlayButton = (props: PlayButtonProps) => {
  const { status, label, title, onClick, size, variant } = withDefaults(playButtonDefaults, props);
  const { button, icon } = playButtonSizes[size];
  const style = {
    '--play-size': button,
    '--play-background': playButtonVariants[variant].background,
    '--play-color': playButtonVariants[variant].color,
  } as CSSProperties;

  return (
    <button type="button" className={styles.play} style={style} aria-label={label} title={title} onClick={onClick}>
      {status === 'loading' ? <Spinner size={icon} /> : <Icon name={status === 'playing' ? 'pause' : 'play'} size={icon} filled />}
    </button>
  );
};
