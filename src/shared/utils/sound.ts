import type { MusicGenre, SoundKind, TrackVersionKind } from '@/shared/constants';
import type { Item, MusicInfo } from '@/shared/types';

// Demo previews are generated in the browser from the item's data (tempo, genre, mood, sound type),
// so every music track, sound effect and video has something real to play without shipping audio files.

export type Voice = 'pluck' | 'piano' | 'pad' | 'bass' | 'lead' | 'kick' | 'snare' | 'hat' | 'tek' | 'clap' | 'noise' | 'sweep';

export interface Note {
  time: number; // seconds from the start
  duration: number; // seconds
  frequency: number; // Hz (for noise voices: the filter frequency)
  toFrequency?: number; // sweeps glide to this frequency
  gain: number; // 0-1
  voice: Voice;
}

export interface SoundSchedule {
  duration: number; // seconds
  notes: Note[];
  // Music repeats: the notes are written up to the end of one loop, which then repeats to the end of the track.
  // Rendering one loop instead of the whole track keeps long tracks fast to prepare.
  loop?: { start: number; length: number };
}

const sampleRate = 22050;
const fade = { in: 0.4, out: 2 } as const; // seconds
const masterGain = 0.55;

// Same seed, same random numbers: a track always sounds the same.
const seededRandom = (seed: string) => {
  let state = [...seed].reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) | 0, 2166136261);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const scales = {
  hijaz: [0, 1, 4, 5, 7, 8, 10], // the sound of Arabic and Egyptian music
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
} as const;

const scaleFor = (music: MusicInfo) => {
  if (music.genres.some((genre) => genre === 'oriental' || genre === 'shaabi')) return scales.hijaz;
  if (music.moods.some((mood) => mood === 'happy' || mood === 'inspiring')) return scales.major;
  return scales.minor;
};

const leadVoices: Record<MusicGenre, Voice> = {
  oriental: 'pluck',
  shaabi: 'lead',
  pop: 'lead',
  electronic: 'lead',
  cinematic: 'piano',
  corporate: 'pluck',
  lofi: 'piano',
  acoustic: 'pluck',
};

const frequencyOf = (root: number, semitones: number) => root * 2 ** (semitones / 12);

// The pitch of a scale step: step 7 is the root an octave up.
const scaleNote = (scale: readonly number[], root: number, step: number) => {
  const octave = Math.floor(step / scale.length);
  return frequencyOf(root, scale[((step % scale.length) + scale.length) % scale.length] + octave * 12);
};

// A music track (or one of its alternate versions) as a list of notes.
export const musicSchedule = (item: Item, version?: TrackVersionKind, durationOverride?: number): SoundSchedule => {
  const music = item.music;
  if (!music) return { duration: 0, notes: [] };
  const random = seededRandom(item.id);
  const scale = scaleFor(music);
  const root = frequencyOf(110, Math.floor(random() * 7)); // A2 to E3
  const beat = 60 / music.bpm;
  const bar = beat * 4;
  const duration = durationOverride ?? music.versions.find((candidate) => candidate.kind === version)?.duration ?? item.duration ?? 60;
  const energetic = music.moods.some((mood) => mood === 'energetic' || mood === 'happy' || mood === 'dramatic');
  const genre = music.genres[0];
  const fourOnTheFloor = genre === 'electronic' || genre === 'shaabi';
  const drums = version !== 'alternate' && (energetic || genre === 'lofi' || genre === 'corporate' || genre === 'pop');
  const lead = leadVoices[genre];
  const progression = [0, 5, 3, 4].map((degree) => (degree + Math.floor(random() * 2)) % 7);
  // A two-bar melody, repeated with small changes so it sounds like a tune.
  const motif = Array.from({ length: 16 }, () => (random() < (energetic ? 0.75 : 0.55) ? Math.floor(random() * 9) - 1 : null));

  // A two-bar intro (none for a loop), then a four-bar pattern (chords, melody, drums) that repeats.
  const introBars = version === 'loop' ? 0 : 2;
  const patternBars = progression.length;
  const notes: Note[] = [];
  const bars = Math.min(Math.ceil(duration / bar), introBars + patternBars);
  for (let barIndex = 0; barIndex < bars; barIndex++) {
    const start = barIndex * bar;
    const chord = progression[barIndex % progression.length];
    const intro = barIndex < introBars;

    for (const step of [0, 2, 4]) {
      notes.push({ time: start, duration: bar, frequency: scaleNote(scale, root * 2, chord + step), gain: 0.07, voice: 'pad' });
    }
    for (let beatIndex = 0; beatIndex < 4; beatIndex += fourOnTheFloor ? 1 : 2) {
      notes.push({ time: start + beatIndex * beat, duration: beat * 0.9, frequency: scaleNote(scale, root / 2, chord), gain: 0.3, voice: 'bass' });
    }
    if (!intro) {
      // Eighth notes: the first half of the motif on even bars, the second half on odd bars.
      const half = (barIndex % 2) * 8;
      for (let index = 0; index < 8; index++) {
        const step = motif[half + index];
        if (step === null) continue;
        const variation = barIndex % 4 === 3 && index === 0 ? 1 : 0; // every fourth bar starts a step higher
        notes.push({
          time: start + index * (beat / 2),
          duration: beat * 0.7,
          frequency: scaleNote(scale, root * 4, chord + step + variation),
          gain: 0.16,
          voice: lead,
        });
      }
    }
    if (drums && !intro) {
      for (let beatIndex = 0; beatIndex < 4; beatIndex++) {
        const time = start + beatIndex * beat;
        if (fourOnTheFloor || beatIndex % 2 === 0) notes.push({ time, duration: 0.3, frequency: 150, gain: 0.5, voice: 'kick' });
        if (beatIndex % 2 === 1) notes.push({ time, duration: 0.18, frequency: 1800, gain: 0.25, voice: genre === 'shaabi' ? 'clap' : 'snare' });
        notes.push({ time: time + beat / 2, duration: 0.05, frequency: 8000, gain: 0.08, voice: 'hat' });
        if (genre === 'oriental' || genre === 'shaabi') notes.push({ time: time + beat * 0.75, duration: 0.05, frequency: 2600, gain: 0.12, voice: 'tek' });
      }
    }
  }
  const loopEnd = (introBars + patternBars) * bar;
  return {
    duration,
    notes: notes.filter((note) => note.time < duration),
    loop: duration > loopEnd ? { start: introBars * bar, length: patternBars * bar } : undefined,
  };
};

// A sound effect, or a stock video's sound, as a list of sounds.
export const soundEffectSchedule = (kind: SoundKind, duration: number, seed: string): SoundSchedule => {
  const random = seededRandom(seed);
  const notes: Note[] = [];
  const bed = (frequency: number, gain: number) => notes.push({ time: 0, duration, frequency, gain, voice: 'noise' });
  const every = (interval: number, spread: number, add: (time: number) => void) => {
    for (let time = interval * random(); time < duration; time += interval * (1 - spread / 2 + random() * spread)) add(time);
  };

  switch (kind) {
    case 'whoosh':
      every(1.6, 0.4, (time) =>
        notes.push({ time, duration: 0.7, frequency: 300, toFrequency: 3500 + random() * 3000, gain: 0.5, voice: 'sweep' }),
      );
      break;
    case 'street':
      bed(900, 0.12);
      every(2.5, 1, (time) => notes.push({ time, duration: 0.25, frequency: 420 + random() * 120, gain: 0.12, voice: 'lead' }));
      every(0.5, 1, (time) => notes.push({ time, duration: 0.08, frequency: 1500 + random() * 1500, gain: 0.05, voice: 'tek' }));
      break;
    case 'traffic':
      bed(500, 0.16);
      every(1.8, 1, (time) => {
        const pitch = 380 + random() * 200;
        notes.push({ time, duration: 0.18, frequency: pitch, gain: 0.14, voice: 'lead' });
        notes.push({ time: time + 0.24, duration: 0.3, frequency: pitch, gain: 0.14, voice: 'lead' });
      });
      every(3, 0.5, (time) => notes.push({ time, duration: 1.5, frequency: 70, gain: 0.25, voice: 'bass' }));
      break;
    case 'clicks':
      every(0.45, 0.6, (time) => notes.push({ time, duration: 0.06, frequency: 1200 + random() * 2400, gain: 0.35, voice: 'tek' }));
      every(1.3, 0.5, (time) => notes.push({ time, duration: 0.15, frequency: 880 + random() * 440, gain: 0.12, voice: 'pluck' }));
      break;
    case 'applause':
      bed(2500, 0.08);
      every(0.03, 1, (time) => notes.push({ time, duration: 0.05, frequency: 1200 + random() * 2000, gain: 0.08 + random() * 0.1, voice: 'clap' }));
      break;
    case 'impacts':
      every(2.4, 0.3, (time) => {
        notes.push({ time, duration: 1.4, frequency: 90, gain: 0.8, voice: 'kick' });
        notes.push({ time, duration: 1.8, frequency: 400, toFrequency: 120, gain: 0.3, voice: 'sweep' });
        notes.push({ time: time + 1.4, duration: 0.9, frequency: 200, toFrequency: 5000, gain: 0.2, voice: 'sweep' });
      });
      break;
    case 'waves':
      every(4, 0.4, (time) => notes.push({ time, duration: 3.5, frequency: 700 + random() * 400, gain: 0.35, voice: 'noise' }));
      bed(400, 0.05);
      break;
    case 'rain':
      bed(3500, 0.12);
      every(0.06, 1, (time) => notes.push({ time, duration: 0.03, frequency: 3000 + random() * 3000, gain: 0.05, voice: 'tek' }));
      break;
    case 'wind':
      every(5, 0.5, (time) => notes.push({ time, duration: 5, frequency: 300, toFrequency: 900 + random() * 600, gain: 0.25, voice: 'sweep' }));
      bed(350, 0.06);
      break;
  }
  return { duration, notes: notes.filter((note) => note.time < duration) };
};

// One noise buffer per render, shared by every noise voice.
const makeNoise = (context: BaseAudioContext) => {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  const random = seededRandom('noise');
  for (let index = 0; index < data.length; index++) data[index] = random() * 2 - 1;
  return buffer;
};

const scheduleNote = (context: BaseAudioContext, output: AudioNode, noise: AudioBuffer, note: Note) => {
  const { time, duration, frequency, toFrequency, gain, voice } = note;
  const end = time + duration;
  const amp = context.createGain();
  amp.connect(output);
  const envelope = (attack: number, release: number) => {
    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), time + attack);
    amp.gain.setValueAtTime(Math.max(gain, 0.0002), Math.max(time + attack, end - release));
    amp.gain.exponentialRampToValueAtTime(0.0001, end);
  };
  const decay = (length: number) => {
    amp.gain.setValueAtTime(gain, time);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + length);
  };
  const oscillator = (type: OscillatorType, pitch = frequency, into: AudioNode = amp) => {
    const node = context.createOscillator();
    node.type = type;
    node.frequency.setValueAtTime(pitch, time);
    node.connect(into);
    node.start(time);
    node.stop(end + 0.05);
    return node;
  };
  const noiseThrough = (type: BiquadFilterType, filterFrequency = frequency) => {
    const source = context.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(filterFrequency, time);
    source.connect(filter);
    filter.connect(amp);
    source.start(time, (time * 7) % 1.5);
    source.stop(end + 0.05);
    return filter;
  };
  const lowpass = (cutoff: number) => {
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, time);
    filter.connect(amp);
    return filter;
  };

  switch (voice) {
    case 'pluck': {
      decay(Math.min(duration * 1.6, 1.2));
      const filter = lowpass(frequency * 6);
      oscillator('sawtooth', frequency, filter);
      oscillator('triangle', frequency * 2, filter);
      break;
    }
    case 'piano':
      decay(Math.min(duration * 3, 2.5));
      oscillator('triangle');
      oscillator('sine', frequency * 2);
      break;
    case 'pad':
      envelope(Math.min(0.3, duration / 3), Math.min(0.4, duration / 3));
      oscillator('sine');
      oscillator('triangle', frequency * 1.003);
      break;
    case 'bass':
      envelope(0.01, 0.08);
      oscillator('triangle', frequency, lowpass(frequency * 4));
      break;
    case 'lead':
      envelope(0.01, Math.min(0.1, duration / 2));
      oscillator('square', frequency, lowpass(frequency * 3));
      break;
    case 'kick': {
      decay(duration);
      const node = oscillator('sine');
      node.frequency.exponentialRampToValueAtTime(Math.max(frequency / 3.5, 30), time + Math.min(duration, 0.15));
      break;
    }
    case 'snare':
      decay(duration);
      noiseThrough('bandpass');
      oscillator('triangle', 180);
      break;
    case 'clap':
    case 'tek':
      decay(duration);
      noiseThrough('bandpass');
      break;
    case 'hat':
      decay(duration);
      noiseThrough('highpass');
      break;
    case 'noise':
      envelope(Math.min(1, duration / 3), Math.min(1.2, duration / 3));
      noiseThrough('lowpass');
      break;
    case 'sweep': {
      envelope(duration * 0.45, duration * 0.45);
      const filter = noiseThrough('bandpass');
      filter.Q.setValueAtTime(2, time);
      filter.frequency.exponentialRampToValueAtTime(toFrequency ?? frequency * 4, end);
      break;
    }
  }
};

// The point in the written notes that plays at `time` (a repeating track loops back).
const sourceTime = ({ loop }: SoundSchedule, time: number) =>
  loop && time >= loop.start + loop.length ? loop.start + ((time - loop.start) % loop.length) : time;

// How loud a preview is at a point in time: its fade in and fade out.
const fadeAt = (time: number, duration: number) => Math.max(0, Math.min(1, time / fade.in, (duration - time) / fade.out));

// Renders a schedule to audio, fading in and out like a real preview. A repeating track renders one loop and copies it.
export const renderSchedule = async (schedule: SoundSchedule): Promise<AudioBuffer> => {
  const { duration, notes, loop } = schedule;
  const totalLength = Math.max(1, Math.ceil(duration * sampleRate));
  const renderedLength = loop ? Math.ceil((loop.start + loop.length) * sampleRate) : totalLength;
  const context = new OfflineAudioContext(1, renderedLength, sampleRate);
  const master = context.createGain();
  master.gain.setValueAtTime(masterGain, 0);
  const compressor = context.createDynamicsCompressor();
  master.connect(compressor);
  compressor.connect(context.destination);
  const noise = makeNoise(context);
  for (const note of notes) scheduleNote(context, master, noise, note);
  const rendered = (await context.startRendering()).getChannelData(0);

  const output = new Float32Array(totalLength);
  for (let index = 0; index < totalLength; index++) {
    const time = index / sampleRate;
    const source = Math.min(rendered.length - 1, Math.round(sourceTime(schedule, time) * sampleRate));
    output[index] = rendered[source] * fadeAt(time, duration);
  }
  const buffer = new AudioBuffer({ length: totalLength, sampleRate, numberOfChannels: 1 });
  buffer.copyToChannel(output, 0);
  return buffer;
};

// 16-bit mono WAV, playable by an <audio> element.
export const toWav = (buffer: AudioBuffer): Blob => {
  const samples = buffer.getChannelData(0);
  const bytes = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const text = (offset: number, value: string) => [...value].forEach((char, index) => bytes.setUint8(offset + index, char.charCodeAt(0)));
  text(0, 'RIFF');
  bytes.setUint32(4, 36 + samples.length * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  bytes.setUint32(16, 16, true);
  bytes.setUint16(20, 1, true);
  bytes.setUint16(22, 1, true);
  bytes.setUint32(24, buffer.sampleRate, true);
  bytes.setUint32(28, buffer.sampleRate * 2, true);
  bytes.setUint16(32, 2, true);
  bytes.setUint16(34, 16, true);
  text(36, 'data');
  bytes.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => bytes.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true));
  return new Blob([bytes], { type: 'audio/wav' });
};

// Loudness over time (0-1 per bar of the waveform), worked out from the notes without rendering any audio.
export const schedulePeaks = (schedule: SoundSchedule, bars: number): number[] => {
  const { duration, notes } = schedule;
  if (duration <= 0) return new Array<number>(bars).fill(0);
  const binLength = duration / bars;
  const levels = Array.from({ length: bars }, (_, bin) => {
    const time = sourceTime(schedule, (bin + 0.5) * binLength);
    return notes.reduce((level, note) => {
      const age = time - note.time;
      if (age < -binLength / 2 || age > note.duration) return level;
      return level + note.gain * Math.exp(-Math.max(age, 0) / Math.max(note.duration, 0.05));
    }, 0);
  });
  const loudest = Math.max(...levels, 0.0001);
  return levels.map((level, bin) => Math.sqrt(level / loudest) * Math.max(fadeAt(bin * binLength, duration), 0.05));
};
