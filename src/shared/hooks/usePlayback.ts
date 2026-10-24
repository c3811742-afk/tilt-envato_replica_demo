import { useEffect, useState, useSyncExternalStore } from 'react';
import { playback, type PlaybackSource } from '@/shared/utils';

// The site-wide player, seen from one source: whether it's the one playing, and controls for it.
export const usePlayback = (source: PlaybackSource) => {
  const state = useSyncExternalStore(playback.subscribe, playback.getState);
  const active = state.activeId === source.id;
  return {
    active,
    status: active ? state.status : 'idle',
    duration: active && state.duration ? state.duration : source.schedule().duration,
    muted: state.muted,
    toggle: () => playback.toggle(source),
    seek: (seconds: number) => playback.seek(source, seconds),
    setMuted: playback.setMuted,
  };
};

// The playing position (seconds) of the active source, updated every frame while it plays.
export const usePlaybackTime = (active: boolean) => {
  const [frameTime, setFrameTime] = useState(0);
  // Any player change (pause, a seek while paused) re-renders, so a paused position is read fresh.
  const state = useSyncExternalStore(playback.subscribe, playback.getState);
  const playing = active && state.status === 'playing';

  useEffect(() => {
    if (!playing) return;
    let frame = requestAnimationFrame(function tick() {
      setFrameTime(playback.currentTime());
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  if (!active) return 0;
  return playing ? frameTime : playback.currentTime();
};

// Stops this source's sound when the component showing it goes away (e.g. leaving the page).
export const useStopOnUnmount = (id: string) => {
  useEffect(() => () => playback.stop(id), [id]);
};
