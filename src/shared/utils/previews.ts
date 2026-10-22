import { catalog, formatSoftware, templateCategories, type Software, type TemplateCategory, type TrackVersionKind } from '@/shared/constants';
import type { CategoryId, Item } from '@/shared/types';
import { toFileName } from './download';
import { originalTitle } from './itemText';
import type { PlaybackSource } from './playback';
import { musicSchedule, schedulePeaks, soundEffectSchedule } from './sound';

export interface PreviewOptions {
  version?: TrackVersionKind; // an alternate version of a music track
  song?: Item | null; // the music playing in a video template's preview or a tutorial
  tutorial?: boolean; // the template's tutorial instead of its preview
  steps?: number; // tutorial steps (the tutorial is this many steps long)
}

// How long a preview is, in seconds.
export const previewDuration = (item: Item, { version, tutorial, steps = 0 }: PreviewOptions = {}) => {
  if (tutorial) return steps * catalog.tutorialStepSeconds;
  return item.music?.versions.find((candidate) => candidate.kind === version)?.duration ?? item.duration ?? catalog.defaultPreviewSeconds;
};

// The sound of an item's preview: the track itself, the sound effect, a stock video's sound,
// or the song a template's preview or tutorial plays.
export const previewSource = (item: Item, options: PreviewOptions = {}): PlaybackSource => {
  const { version, song, tutorial } = options;
  const duration = previewDuration(item, options);
  return {
    id: [item.id, version ?? (tutorial ? 'tutorial' : 'main'), song?.id ?? ''].join(':'),
    schedule: () => {
      if (item.music && !tutorial) return musicSchedule(item, version);
      if (song?.music) return musicSchedule(song, undefined, duration);
      return soundEffectSchedule(item.sound ?? 'wind', duration, item.id);
    },
  };
};

// The waveform of a preview (loudness of each bar).
export const previewPeaks = (source: PlaybackSource) => schedulePeaks(source.schedule(), catalog.waveformBars);

export const isTemplateCategory = (categoryId: CategoryId): categoryId is TemplateCategory =>
  (templateCategories as readonly CategoryId[]).includes(categoryId);

export interface ItemFile {
  name: string;
  role: 'project' | 'media' | 'help' | 'fonts';
  format?: string;
  app?: Software; // the app that opens a project file
}

// What's inside an item's download: a file per format, plus a help file and the font links for templates.
export const itemFiles = (item: Item): ItemFile[] => {
  const base = toFileName(originalTitle(item));
  const files: ItemFile[] = item.formats.map((format) => {
    const app = formatSoftware[format];
    return { name: `${base}.${format.toLowerCase()}`, role: app ? 'project' : 'media', format, app };
  });
  if (!isTemplateCategory(item.categoryId)) return files;
  return [...files, { name: 'help.pdf', role: 'help' }, { name: 'fonts.txt', role: 'fonts' }];
};
