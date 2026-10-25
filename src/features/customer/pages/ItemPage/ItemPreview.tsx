import { useMemo, useState } from 'react';
import {
  DetailList,
  MediaPreview,
  FontPreviewControls,
  FontSample,
  fontPreviewDefaults,
  ItemCover,
  MediaPlayer,
  Stack,
  Tabs,
  Text,
  TextLink,
  VideoStage,
  type FontPreviewSettings,
} from '@/shared/components';
import { catalog, categoryIcons, itemPath, previewKinds } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item } from '@/shared/types';
import { api, fillText, formatNumber, isTemplateCategory, itemFiles, previewPeaks, previewSource } from '@/shared/utils';
import { TrackVersions } from './TrackVersions';

interface ItemPreviewProps {
  item: Item;
  title: string; // in the language the page shows it in
}

// An item's preview. Templates also have a tutorial and a look inside their files.
export const ItemPreview = ({ item, title }: ItemPreviewProps) => {
  const { text } = useLocale();
  const preview = <CoverPreview item={item} title={title} />;
  if (!isTemplateCategory(item.categoryId)) return preview;

  return (
    <Tabs
      label={fillText(text.player.previewOf, { title })}
      tabs={[
        { value: 'cover', label: text.item.previewTabs.cover, content: preview },
        { value: 'tutorial', label: text.item.previewTabs.tutorial, content: <TutorialPreview item={item} title={title} /> },
        { value: 'files', label: text.item.previewTabs.files, content: <FilesPreview item={item} /> },
      ]}
    />
  );
};

// Loads a song for a preview (the music in a video template, or a tutorial's background); null when there is none.
const useSong = (songId: string | undefined) => {
  const song = useAsync(() => (songId ? api.getItem(songId) : Promise.resolve(null)), [songId]);
  return song.status === 'success' ? song.data : null;
};

const CoverPreview = ({ item, title }: ItemPreviewProps) => {
  const { text, locale } = useLocale();
  const kind = previewKinds[item.categoryId];
  const song = useSong(kind === 'video' ? item.previewSongId : undefined);
  const source = useMemo(() => previewSource(item, { song }), [item, song]);
  const peaks = useMemo(() => previewPeaks(source), [source]);
  const [font, setFont] = useState<FontPreviewSettings>(fontPreviewDefaults);

  // A creator's own preview clip plays as it is.
  if (item.previewVideo) {
    return <MediaPreview kind="video" src={item.previewVideo} alt={fillText(text.item.previewLabel, { title })} />;
  }

  if (kind === 'video') {
    return (
      <Stack gap={vars.spacing[3]}>
        <MediaPlayer
          kind="video"
          source={source}
          title={title}
          stage={(time, duration) => (
            <VideoStage
              image={item.image}
              accent={item.accent}
              icon={categoryIcons[item.categoryId]}
              seed={item.id}
              progress={duration ? time / duration : 0}
              title={item.categoryId === 'videoTemplates' ? title : undefined}
            />
          )}
        />
        {song && (
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {text.item.songCredit}:{' '}
            <TextLink to={itemPath(song.id)} variant="bodySm">
              {fillText(text.item.songCreditBy, { title: song.title[locale], creator: song.creator.name })}
            </TextLink>
          </Text>
        )}
      </Stack>
    );
  }

  if (kind === 'audio') {
    return (
      <Stack gap={vars.spacing[3]}>
        <ItemCover image={item.image} accent={item.accent} icon={categoryIcons[item.categoryId]} seed={item.id} label={fillText(text.item.previewLabel, { title })} />
        <MediaPlayer kind="audio" source={source} title={title} peaks={peaks} />
        {item.music && item.music.versions.length > 0 && (
          <Stack gap={vars.spacing[2]}>
            <Text as="h2" variant="h4">
              {text.item.versions}
            </Text>
            <TrackVersions item={item} />
          </Stack>
        )}
      </Stack>
    );
  }

  if (kind === 'font' && item.font) {
    const sample = font.text || text.fontPreview.sample[item.font.arabic ? locale : 'en'];
    return (
      <Stack gap={vars.spacing[4]}>
        <FontPreviewControls value={font} onChange={setFont} />
        <div aria-live="polite">
          <FontSample family={item.font.family} text={sample} size={`${font.size}rem`} align={font.align} maxLines={4} />
        </div>
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {fillText(text.item.previewFont, { family: item.font.family })}
        </Text>
      </Stack>
    );
  }

  return (
    <ItemCover
      image={item.image}
      accent={item.accent}
      icon={categoryIcons[item.categoryId]}
      seed={item.id}
      title={title}
      showTitle
      label={fillText(text.item.previewLabel, { title })}
    />
  );
};

const TutorialPreview = ({ item, title }: ItemPreviewProps) => {
  const { text, locale } = useLocale();
  const song = useSong(catalog.tutorialSongId);
  const steps = isTemplateCategory(item.categoryId) ? text.item.tutorialSteps[item.categoryId] : [];
  const source = useMemo(() => previewSource(item, { tutorial: true, steps: steps.length, song }), [item, steps.length, song]);

  return (
    <MediaPlayer
      kind="video"
      source={source}
      title={fillText(text.item.tutorialLabel, { title })}
      stage={(time, duration) => {
        const index = Math.min(steps.length - 1, Math.floor(time / catalog.tutorialStepSeconds));
        return (
          <VideoStage
            image={item.image}
            accent={item.accent}
            icon={categoryIcons[item.categoryId]}
            seed={item.id}
            progress={duration ? time / duration : 0}
            step={fillText(text.tour.stepOf, { current: formatNumber(index + 1, locale), total: formatNumber(steps.length, locale) })}
            caption={steps[index]}
          />
        );
      }}
    />
  );
};

const FilesPreview = ({ item }: { item: Item }) => {
  const { text } = useLocale();
  const roles = text.item.fileRoles;
  const rows = itemFiles(item).map((file) => ({
    label: file.name,
    value:
      file.role === 'project' && file.app
        ? fillText(roles.project, { app: text.filters.software.options[file.app] })
        : file.role === 'media'
          ? fillText(roles.media, { format: file.format ?? '' })
          : roles[file.role],
  }));

  return (
    <Stack gap={vars.spacing[3]}>
      <Text as="h2" variant="h4">
        {text.item.filesTitle}
      </Text>
      <DetailList rows={rows} />
    </Stack>
  );
};
