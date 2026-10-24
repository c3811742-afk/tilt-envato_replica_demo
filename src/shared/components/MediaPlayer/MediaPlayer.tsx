import { useEffect, useRef, useState } from 'react';
import { useLocale, usePlayback, usePlaybackTime, useStopOnUnmount, useStoredValue } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { cx, fillText, formatDuration, preferences, withDefaults } from '@/shared/utils';
import { Button } from '../Button';
import { FieldMessage } from '../FieldMessage';
import { Icon } from '../Icon';
import { PlayButton } from '../PlayButton';
import { Slider } from '../Slider';
import { Text } from '../Text';
import { Waveform } from '../Waveform';
import { mediaPlayerDefaults } from './MediaPlayer.defaults';
import type { MediaPlayerProps } from './MediaPlayer.types';
import styles from './MediaPlayer.module.css';

// Plays an item's preview: play / pause, position, mute, volume, and full screen for video.
// Only one preview plays at a time on the whole site; the volume is shared by all of them.
export const MediaPlayer = (props: MediaPlayerProps) => {
  const { source, title, kind, peaks, stage } = withDefaults(mediaPlayerDefaults, props);
  const { text } = useLocale();
  const player = usePlayback(source);
  const time = usePlaybackTime(player.active);
  const [volume, setVolume] = useStoredValue(preferences.volume);
  const rootRef = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(false);
  useStopOnUnmount(source.id);

  useEffect(() => {
    const onChange = () => setFullScreen(document.fullscreenElement === rootRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullScreen = () => {
    const action = fullScreen ? document.exitFullscreen() : rootRef.current?.requestFullscreen();
    action?.catch((error: unknown) => console.error('Full screen is not available', error));
  };

  const { duration, status } = player;
  const playing = status === 'playing';
  const progress = duration ? Math.min(1, time / duration) : 0;
  const position = `${formatDuration(time)} / ${formatDuration(duration)}`;
  const playLabel = fillText(playing ? text.player.pauseTitle : text.player.playTitle, { title: title ?? '' });

  const playButton = (big: boolean) => (
    <PlayButton
      status={status}
      size={big ? 'lg' : 'md'}
      variant="primary"
      label={playLabel}
      title={playing ? text.player.pause : text.player.play}
      onClick={player.toggle}
    />
  );

  return (
    <div ref={rootRef} className={cx(styles.player, styles[kind], fullScreen && styles.fullScreen)}>
      {kind === 'video' && stage && (
        <div className={styles.stage} onClick={player.toggle}>
          {stage(time, duration)}
          {!playing && <div className={styles.overlay}>{playButton(true)}</div>}
        </div>
      )}

      <div className={styles.controls}>
        {playButton(false)}
        {kind === 'audio' ? (
          <Waveform
            peaks={peaks}
            progress={progress}
            onSeek={(fraction) => player.seek(fraction * duration)}
            label={text.player.seek}
            valueText={position}
            height={vars.sizes.player.waveform}
          />
        ) : (
          <div className={styles.position}>
            <Slider
              label={text.player.seek}
              value={time}
              max={duration || 1}
              onChange={player.seek}
              valueText={position}
            />
          </div>
        )}
        <Text as="span" variant="label" color={vars.colors.textMuted}>
          <span className={styles.time} dir="ltr">
            {position}
          </span>
        </Text>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={player.muted ? text.player.unmute : text.player.mute}
          title={player.muted ? text.player.unmute : text.player.mute}
          aria-pressed={player.muted}
          onClick={() => player.setMuted(!player.muted)}
        >
          <Icon name={player.muted ? 'volumeOff' : 'volume'} />
        </button>
        <div className={styles.volume}>
          <Slider label={text.player.volume} value={volume} onChange={setVolume} width={vars.sizes.slider.volume} />
        </div>
        {kind === 'video' && (
          <button
            type="button"
            className={styles.iconButton}
            aria-label={fullScreen ? text.player.exitFullScreen : text.player.fullScreen}
            title={fullScreen ? text.player.exitFullScreen : text.player.fullScreen}
            onClick={toggleFullScreen}
          >
            <Icon name={fullScreen ? 'fullscreenExit' : 'fullscreen'} />
          </button>
        )}
      </div>

      {status === 'error' && (
        <div className={styles.error}>
          <FieldMessage tone="error" message={text.player.failed} />
          <Button variant="outline" size="sm" onClick={player.toggle}>
            {text.common.tryAgain}
          </Button>
        </div>
      )}
    </div>
  );
};
