import { musicLinkPatterns, type MusicLinkService, type MusicMood } from '@/shared/constants';
import type { Item, SoundProfile } from '@/shared/types';

// How loud and busy each mood sounds, from 0 (quiet, sparse) to 1 (loud, busy).
const moodEnergy: Record<MusicMood, number> = {
  calm: 0.2,
  romantic: 0.35,
  inspiring: 0.55,
  happy: 0.7,
  dramatic: 0.75,
  energetic: 0.9,
};

const tempo = { min: 60, max: 180 } as const; // BPM range we look for
const analysis = {
  maxSeconds: 60, // only the first minute is measured
  frameSeconds: 0.01, // energy is measured every 10 ms
  loudRms: 0.25, // an RMS this high counts as full energy
} as const;

// The profile of a music item, from its tempo and moods.
export const itemSoundProfile = (item: Item): SoundProfile | null => {
  if (!item.music) return null;
  const { moods, bpm } = item.music;
  const energy = moods.reduce((total, mood) => total + moodEnergy[mood], 0) / Math.max(moods.length, 1);
  return { bpm, energy };
};

// 0 = same tempo and energy. Half and double tempo count as the same feel.
export const soundDistance = (a: SoundProfile, b: SoundProfile) => {
  const tempoGap = Math.min(...[b.bpm, b.bpm * 2, b.bpm / 2].map((bpm) => Math.abs(a.bpm - bpm)));
  return (tempoGap / (tempo.max - tempo.min)) * 0.6 + Math.abs(a.energy - b.energy) * 0.4;
};

// Brings a tempo into the 60-180 BPM range by halving or doubling it.
const foldTempo = (bpm: number) => {
  let folded = bpm;
  while (folded < tempo.min) folded *= 2;
  while (folded > tempo.max) folded /= 2;
  return Math.round(folded);
};

// Measures the tempo and energy of an audio file the user uploaded.
// Rejects when the browser can't decode the file (not audio, or an unsupported format).
export const analyzeAudioFile = async (file: Blob): Promise<SoundProfile> => {
  const context = new OfflineAudioContext(1, 1, 44100);
  const buffer = await context.decodeAudioData(await file.arrayBuffer());
  const samples = buffer.getChannelData(0);
  const frameSize = Math.round(buffer.sampleRate * analysis.frameSeconds);
  const frameCount = Math.min(Math.floor(samples.length / frameSize), Math.round(analysis.maxSeconds / analysis.frameSeconds));
  if (frameCount < 2) throw new Error('The audio file is too short to analyze');

  // Loudness of each frame, and how much it jumps up from the previous one (where beats start).
  const rms = new Float32Array(frameCount);
  for (let frame = 0; frame < frameCount; frame++) {
    let sum = 0;
    for (let index = frame * frameSize; index < (frame + 1) * frameSize; index++) sum += samples[index] ** 2;
    rms[frame] = Math.sqrt(sum / frameSize);
  }
  const onsets = rms.map((value, frame) => (frame === 0 ? 0 : Math.max(0, value - rms[frame - 1])));

  // The beat period is the delay at which the onsets line up with themselves best.
  const framesPerMinute = 60 / analysis.frameSeconds;
  let bestLag = 0;
  let bestScore = -Infinity;
  for (let lag = Math.round(framesPerMinute / tempo.max); lag <= Math.round(framesPerMinute / tempo.min); lag++) {
    let score = 0;
    for (let frame = lag; frame < frameCount; frame++) score += onsets[frame] * onsets[frame - lag];
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }

  const meanRms = rms.reduce((total, value) => total + value, 0) / frameCount;
  const busyness = onsets.filter((value) => value > meanRms * 0.5).length / frameCount;
  const energy = Math.min(1, (meanRms / analysis.loudRms) * 0.7 + busyness * 3);
  return { bpm: foldTempo(framesPerMinute / Math.max(bestLag, 1)), energy };
};

// The service a pasted link is from, or null when it isn't a YouTube or Spotify track link.
export const musicLinkService = (link: string): MusicLinkService | null =>
  (Object.keys(musicLinkPatterns) as MusicLinkService[]).find((service) => musicLinkPatterns[service].test(link.trim())) ?? null;

// The demo can't fetch YouTube or Spotify, so it reads a fixed sample profile from the link:
// the same link always gives the same result. (The full product analyzes the audio on the server.)
export const sampleProfileFromLink = (link: string): SoundProfile => {
  const hash = [...link.trim()].reduce((value, char) => (value * 31 + char.charCodeAt(0)) % 100003, 17);
  return { bpm: 70 + (hash % 65), energy: 0.2 + ((hash >> 3) % 70) / 100 };
};

// URL form of a profile: "92-0.45".
export const soundProfileToParam = ({ bpm, energy }: SoundProfile) => `${Math.round(bpm)}-${energy.toFixed(2)}`;

export const soundProfileFromParam = (value: string | null): SoundProfile | undefined => {
  const match = value?.match(/^(\d{2,3})-(0(\.\d+)?|1(\.0+)?)$/);
  return match ? { bpm: Number(match[1]), energy: Number(match[2]) } : undefined;
};
