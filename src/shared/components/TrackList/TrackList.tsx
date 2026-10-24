import { useLocale, useStoredValue } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { preferences, withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { Slider } from '../Slider';
import { TrackRow } from '../TrackRow';
import { trackListDefaults } from './TrackList.defaults';
import type { TrackListProps } from './TrackList.types';
import styles from './TrackList.module.css';

// Music and sound effects as a list of tracks, with one volume control for all of them.
export const TrackList = (props: TrackListProps) => {
  const { items, label, actionsFor, showVolume } = withDefaults(trackListDefaults, props);
  const { text } = useLocale();
  const [volume, setVolume] = useStoredValue(preferences.volume);

  return (
    <div className={styles.list}>
      {showVolume && (
        <div className={styles.volume}>
          <Icon name={volume === 0 ? 'volumeOff' : 'volume'} size={vars.sizes.icon.sm} />
          <Slider label={text.player.volume} value={volume} onChange={setVolume} width={vars.sizes.slider.volume} />
        </div>
      )}
      <ul aria-label={label ?? text.tracks.label}>
        {items.map((item) => (
          <TrackRow key={item.id} item={item} actions={actionsFor?.(item)} />
        ))}
      </ul>
    </div>
  );
};
