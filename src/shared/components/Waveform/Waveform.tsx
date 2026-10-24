import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { waveformDefaults } from './Waveform.defaults';
import type { WaveformProps } from './Waveform.types';
import styles from './Waveform.module.css';

const percent = 100;

// A track's waveform. With `onSeek` it is also the position slider: click a point or use the arrow keys.
export const Waveform = (props: WaveformProps) => {
  const { peaks, progress, onSeek, label, valueText, height, color, playedColor, keyStep } = withDefaults(waveformDefaults, props);
  const playedBars = Math.round(progress * peaks.length);
  const style = { '--waveform-height': height, '--waveform-color': color, '--waveform-played': playedColor } as CSSProperties;

  // The bars run from the start of the line, so in Arabic the start is on the right.
  const seekAt = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const offset = rtl ? box.right - event.clientX : event.clientX - box.left;
    onSeek?.(Math.min(1, Math.max(0, offset / box.width)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const moves: Record<string, number> = {
      ArrowUp: keyStep,
      ArrowDown: -keyStep,
      ArrowRight: rtl ? -keyStep : keyStep,
      ArrowLeft: rtl ? keyStep : -keyStep,
      Home: -1,
      End: 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    onSeek?.(Math.min(1, Math.max(0, progress + moves[event.key])));
  };

  const interactive = Boolean(onSeek);
  return (
    <div
      className={cx(styles.waveform, interactive && styles.interactive)}
      style={style}
      role={interactive ? 'slider' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? label : undefined}
      aria-hidden={interactive ? undefined : true}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? percent : undefined}
      aria-valuenow={interactive ? Math.round(progress * percent) : undefined}
      aria-valuetext={interactive ? valueText : undefined}
      onClick={interactive ? seekAt : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
    >
      {peaks.map((peak, index) => (
        <span
          key={index}
          className={cx(styles.bar, index < playedBars && styles.played)}
          style={{ '--bar-height': `${Math.max(peak, 0.04) * percent}%` } as CSSProperties}
        />
      ))}
    </div>
  );
};
