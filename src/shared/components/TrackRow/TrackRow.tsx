import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { categoryIcons, itemPath } from '@/shared/constants';
import { useLocale, usePlayback, usePlaybackTime } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { cx, fillText, formatDuration, formatNumber, previewPeaks, previewSource, withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { ItemCover } from '../ItemCover';
import { PlayButton } from '../PlayButton';
import { Text } from '../Text';
import { Waveform } from '../Waveform';
import { trackRowDefaults } from './TrackRow.defaults';
import type { TrackRowProps } from './TrackRow.types';
import styles from './TrackRow.module.css';

// One track in a music list: play button, title, waveform (click to jump), length, tempo and actions.
// A track with alternate versions and loops can be expanded to play them too.
export const TrackRow = (props: TrackRowProps) => {
  const { item, version, actions, showVersions, linkToItem } = withDefaults(trackRowDefaults, props);
  const { text, locale } = useLocale();
  const source = useMemo(() => previewSource(item, { version }), [item, version]);
  const peaks = useMemo(() => previewPeaks(source), [source]);
  const player = usePlayback(source);
  const time = usePlaybackTime(player.active);
  const [expanded, setExpanded] = useState(false);
  const versions = version ? [] : (item.music?.versions ?? []);

  const title = version ? text.item.versionKinds[version] : item.title[locale];
  const playing = player.status === 'playing';
  const progress = player.duration ? time / player.duration : 0;
  const position = `${formatDuration(time)} / ${formatDuration(player.duration)}`;

  return (
    <li className={cx(styles.track, version && styles.version)}>
      <div className={styles.row}>
        <span className={styles.play}>
          <PlayButton
            status={player.status}
            label={fillText(playing ? text.player.pauseTitle : text.player.playTitle, { title })}
            title={playing ? text.player.pause : text.player.play}
            onClick={player.toggle}
          />
        </span>
        {!version && (
          <div className={styles.thumb}>
            <ItemCover image={item.image} accent={item.accent} icon={categoryIcons[item.categoryId]} seed={item.id} aspectRatio={vars.sizes.aspectRatio.square} />
          </div>
        )}
        <div className={styles.name}>
          {linkToItem && !version ? (
            <Link to={itemPath(item.id)} className={styles.link}>
              <Text as="span" variant="title" maxLines={1} autoDirection>
                {title}
              </Text>
            </Link>
          ) : (
            <Text as="span" variant="title" maxLines={1}>
              {title}
            </Text>
          )}
          {!version && (
            <Text variant="bodySm" color={vars.colors.textMuted} maxLines={1}>
              {fillText(text.item.by, { creator: item.creator.name })}
            </Text>
          )}
        </div>
        <div className={styles.wave}>
          <Waveform
            peaks={peaks}
            progress={progress}
            onSeek={(fraction) => player.seek(fraction * player.duration)}
            label={fillText(text.player.previewOf, { title })}
            valueText={position}
          />
        </div>
        <Text as="span" variant="label" color={vars.colors.textMuted}>
          <span className={styles.meta} dir="ltr">
            {formatDuration(player.duration)}
          </span>
        </Text>
        {item.music && !version && (
          <Text as="span" variant="label" color={vars.colors.textMuted}>
            <span className={styles.meta}>{fillText(text.item.bpm, { bpm: formatNumber(item.music.bpm, locale) })}</span>
          </Text>
        )}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {player.status === 'error' && (
        <Text variant="bodySm" color={vars.colors.danger}>
          {text.player.failed}
        </Text>
      )}
      {showVersions && versions.length > 0 && (
        <>
          <button type="button" className={styles.expand} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? text.tracks.hideVersions : fillText(text.tracks.showVersions, { count: formatNumber(versions.length, locale) })}
            <span className={cx(styles.chevron, expanded && styles.open)}>
              <Icon name="chevronDown" size={vars.sizes.icon.sm} />
            </span>
          </button>
          {expanded && (
            <ul className={styles.versions} aria-label={text.item.versions}>
              {versions.map((alternate) => (
                <TrackRow key={alternate.kind} item={item} version={alternate.kind} showVersions={false} />
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
};
