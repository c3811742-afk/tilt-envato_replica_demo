import { preferences } from './preferences';
import { renderSchedule, toWav, type SoundSchedule } from './sound';

// Something the site can play: an id (one per item and version) and how to build its sound.
export interface PlaybackSource {
  id: string;
  schedule: () => SoundSchedule;
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlaybackState {
  activeId: string | null; // the source that is loaded (playing or paused)
  status: PlaybackStatus;
  duration: number;
  muted: boolean;
}

// Rendered previews are kept for the last few sources, so replaying one doesn't render it again.
const cacheSize = 4;
const rendered = new Map<string, Promise<string>>();

const renderUrl = (source: PlaybackSource) => {
  let url = rendered.get(source.id);
  if (!url) {
    url = renderSchedule(source.schedule()).then((buffer) => URL.createObjectURL(toWav(buffer)));
    rendered.set(source.id, url);
    // A failed render isn't kept, so trying again renders it again.
    url.catch(() => rendered.delete(source.id));
    while (rendered.size > cacheSize) {
      const [oldestId, oldest] = rendered.entries().next().value as [string, Promise<string>];
      rendered.delete(oldestId);
      oldest.then(URL.revokeObjectURL).catch(() => {
        // It failed to render, so there is no URL to release.
      });
    }
  }
  return url;
};

let audio: HTMLAudioElement | null = null;
let state: PlaybackState = { activeId: null, status: 'idle', duration: 0, muted: false };
const listeners = new Set<() => void>();
let request = 0; // a newer play() call cancels an older one that is still rendering

const update = (changes: Partial<PlaybackState>) => {
  state = { ...state, ...changes };
  listeners.forEach((listener) => listener());
};

const element = () => {
  if (!audio) {
    audio = new Audio();
    audio.volume = preferences.volume.get();
    audio.addEventListener('ended', () => update({ status: 'paused' }));
    audio.addEventListener('loadedmetadata', () => update({ duration: audio?.duration ?? 0 }));
    audio.addEventListener('seeked', () => update({})); // lets a paused player show its new position
    preferences.volume.subscribe(() => {
      if (audio) audio.volume = preferences.volume.get();
    });
  }
  return audio;
};

const fail = (error: unknown) => {
  console.error('Preview playback failed', error);
  update({ status: 'error' });
};

// The single player for every preview on the site: starting one stops the one before.
export const playback = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  currentTime: () => audio?.currentTime ?? 0,

  play: async (source: PlaybackSource, startAt?: number) => {
    const player = element();
    if (state.activeId === source.id && state.status !== 'error') {
      if (startAt !== undefined) player.currentTime = startAt;
      try {
        await player.play();
        update({ status: 'playing' });
      } catch (error) {
        fail(error);
      }
      return;
    }
    const current = ++request;
    player.pause();
    update({ activeId: source.id, status: 'loading', duration: source.schedule().duration });
    try {
      const url = await renderUrl(source);
      if (current !== request) return;
      player.src = url;
      player.currentTime = startAt ?? 0;
      await player.play();
      if (current === request) update({ status: 'playing' });
    } catch (error) {
      if (current === request) fail(error);
    }
  },

  pause: () => {
    audio?.pause();
    if (state.status === 'playing' || state.status === 'loading') update({ status: 'paused' });
  },

  // Plays or pauses a source: the play / pause button.
  toggle: (source: PlaybackSource) => {
    if (state.activeId === source.id && state.status === 'playing') playback.pause();
    else void playback.play(source);
  },

  // Moves to a point (seconds). A source that isn't loaded starts playing from there.
  seek: (source: PlaybackSource, seconds: number) => {
    if (state.activeId === source.id && audio && state.status !== 'loading' && state.status !== 'error') {
      audio.currentTime = seconds;
      return;
    }
    void playback.play(source, seconds);
  },

  setMuted: (muted: boolean) => {
    element().muted = muted;
    update({ muted });
  },

  // Stops whatever is playing (e.g. when the page it was started on goes away).
  stop: (id?: string) => {
    if (id && state.activeId !== id) return;
    request++;
    audio?.pause();
    update({ activeId: null, status: 'idle', duration: 0 });
  },
};
