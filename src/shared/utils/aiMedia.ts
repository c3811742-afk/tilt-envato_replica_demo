import {
  aiGeneration,
  aiOutputSizes,
  aiUpscaleFactor,
  aiVideoFramesPerSecond,
  aiVideoScale,
  type AiAspectRatio,
  type AiMockupKind,
  type AiRelightDirection,
  type AiVideoResolution,
  type AiVoiceLanguage,
  type AiVoiceType,
} from '@/shared/constants';
import { seededRandom } from './ai';

// The demo's AI Studio "models": everything is made in the browser with canvas, MediaRecorder and Web Audio.
// Pixel sizes and colors here are part of the generated media, not of the page's design.

export const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The image could not be read'));
    image.src = src;
  });

const blobUrl = async <T>(blob: Blob, work: (url: string) => Promise<T>) => {
  const url = URL.createObjectURL(blob);
  try {
    return await work(url);
  } finally {
    URL.revokeObjectURL(url);
  }
};

// An image (a URL or a file) drawn on a canvas, at its own size or the given one.
export const imageCanvas = async (source: string | Blob, width?: number, height?: number) => {
  const image = typeof source === 'string' ? await loadImage(source) : await blobUrl(source, loadImage);
  const canvas = document.createElement('canvas');
  canvas.width = width ?? image.naturalWidth;
  canvas.height = height ?? image.naturalHeight;
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const context = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  return ctx;
};

const blankCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// An uploaded image scaled down to fit the tools' working size (large photos would be slow to edit).
export const fitImage = async (source: Blob) => {
  const original = await imageCanvas(source);
  const scale = Math.min(1, aiGeneration.maxInputSize / Math.max(original.width, original.height));
  if (scale === 1) return canvasBlob(original);
  const canvas = blankCanvas(Math.round(original.width * scale), Math.round(original.height * scale));
  context(canvas).drawImage(original, 0, 0, canvas.width, canvas.height);
  return canvasBlob(canvas);
};

export const canvasBlob = (canvas: HTMLCanvasElement, type = 'image/png') =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The image could not be saved'))), type));

// A hue for a prompt, so the same words always give the same colors.
const promptHue = (prompt: string) => Math.floor(seededRandom(prompt)() * 360);

// The main color of an image as a hex color (a reference image's colors guide a generation).
export const averageColor = async (source: Blob) => {
  const canvas = await imageCanvas(source, 32, 32);
  const { data } = context(canvas).getImageData(0, 0, 32, 32);
  const sums = [0, 0, 0];
  for (let index = 0; index < data.length; index += 4) [0, 1, 2].forEach((channel) => (sums[channel] += data[index + channel]));
  return `#${sums.map((sum) => Math.round(sum / (data.length / 4)).toString(16).padStart(2, '0')).join('')}`;
};

// Remove background: pixels close to the colors at the image's corners become transparent, with a soft edge.
const cutOut = (canvas: HTMLCanvasElement) => {
  const ctx = context(canvas);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = image;
  const corners = [0, width - 1, (height - 1) * width, height * width - 1].map((pixel) => [data[pixel * 4], data[pixel * 4 + 1], data[pixel * 4 + 2]]);
  const background = [0, 1, 2].map((channel) => corners.reduce((sum, corner) => sum + corner[channel], 0) / corners.length);
  const near = 60;
  const soft = 40;
  for (let index = 0; index < data.length; index += 4) {
    const distance = Math.hypot(data[index] - background[0], data[index + 1] - background[1], data[index + 2] - background[2]);
    data[index + 3] = distance < near ? 0 : distance < near + soft ? Math.round((255 * (distance - near)) / soft) : data[index + 3];
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
};

export const removeBackground = async (source: string | Blob) => canvasBlob(cutOut(await imageCanvas(source)));

// Erase: the marked area is filled from a blurred copy of what's around it.
export const eraseArea = async (source: string | Blob, mask: HTMLCanvasElement) => {
  const canvas = await imageCanvas(source);
  const patch = blankCanvas(canvas.width, canvas.height);
  const patchCtx = context(patch);
  patchCtx.filter = 'blur(18px)';
  patchCtx.drawImage(canvas, 0, 0);
  patchCtx.filter = 'none';
  patchCtx.globalCompositeOperation = 'destination-in';
  patchCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);
  context(canvas).drawImage(patch, 0, 0);
  return canvasBlob(canvas);
};

// Edit with a prompt: the prompt's colors and texture are blended into the marked area (or the whole image).
export const editImage = async (source: string | Blob, prompt: string, mask: HTMLCanvasElement | null) => {
  const canvas = await imageCanvas(source);
  const { width, height } = canvas;
  const hue = promptHue(prompt);
  const layer = blankCanvas(width, height);
  const layerCtx = context(layer);
  const gradient = layerCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `hsl(${hue} 80% 55%)`);
  gradient.addColorStop(1, `hsl(${(hue + 40) % 360} 80% 45%)`);
  layerCtx.fillStyle = gradient;
  layerCtx.fillRect(0, 0, width, height);
  if (mask) {
    layerCtx.globalCompositeOperation = 'destination-in';
    layerCtx.drawImage(mask, 0, 0, width, height);
  }
  const ctx = context(canvas);
  ctx.globalCompositeOperation = 'color';
  ctx.globalAlpha = mask ? 0.85 : 0.45;
  ctx.drawImage(layer, 0, 0);
  return canvasBlob(canvas);
};

export const upscaleImage = async (source: string | Blob) => {
  const original = await imageCanvas(source);
  const canvas = blankCanvas(original.width * aiUpscaleFactor, original.height * aiUpscaleFactor);
  const ctx = context(canvas);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(original, 0, 0, canvas.width, canvas.height);
  return canvasBlob(canvas);
};

// Relight: a warm light falls from one side and the other side darkens.
export const relightImage = async (source: string | Blob, direction: AiRelightDirection) => {
  const canvas = await imageCanvas(source);
  const { width, height } = canvas;
  const ctx = context(canvas);
  const [x0, y0, x1, y1] = direction === 'left' ? [0, 0, width, 0] : direction === 'right' ? [width, 0, 0, 0] : [0, 0, 0, height];
  const light = ctx.createLinearGradient(x0, y0, x1, y1);
  light.addColorStop(0, 'rgba(255, 236, 200, 0.75)');
  light.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
  light.addColorStop(1, 'rgba(0, 0, 30, 0.55)');
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, width, height);
  return canvasBlob(canvas);
};

// Swap background: the subject is cut out and placed on a new generated background.
export const swapBackground = async (source: string | Blob, background: string) => {
  const subject = cutOut(await imageCanvas(source));
  const canvas = await imageCanvas(background, subject.width, subject.height);
  context(canvas).drawImage(subject, 0, 0);
  return canvasBlob(canvas);
};

// Mockups: the design printed on a simple product drawing.
export const makeMockup = async (design: string | Blob, kind: AiMockupKind) => {
  const { width, height } = aiOutputSizes.square;
  const canvas = blankCanvas(width, height);
  const ctx = context(canvas);
  ctx.fillStyle = '#eef0f4';
  ctx.fillRect(0, 0, width, height);
  const art = await imageCanvas(design);
  const product: Record<AiMockupKind, { shape: () => void; area: [number, number, number, number] }> = {
    tshirt: {
      shape: () => {
        ctx.beginPath();
        ctx.moveTo(150, 90);
        ctx.lineTo(210, 70);
        ctx.quadraticCurveTo(256, 110, 302, 70);
        ctx.lineTo(362, 90);
        ctx.lineTo(440, 170);
        ctx.lineTo(390, 215);
        ctx.lineTo(360, 190);
        ctx.lineTo(360, 450);
        ctx.lineTo(152, 450);
        ctx.lineTo(152, 190);
        ctx.lineTo(122, 215);
        ctx.lineTo(72, 170);
        ctx.closePath();
      },
      area: [196, 150, 120, 140],
    },
    phone: {
      shape: () => ctx.roundRect(166, 40, 180, 432, 28),
      area: [178, 70, 156, 372],
    },
    poster: {
      shape: () => ctx.rect(126, 56, 260, 360),
      area: [140, 70, 232, 332],
    },
    mug: {
      shape: () => {
        ctx.roundRect(130, 140, 220, 250, 18);
        ctx.moveTo(350, 200);
        ctx.arc(350, 265, 55, -Math.PI / 2, Math.PI / 2);
      },
      area: [150, 180, 180, 170],
    },
  };
  const { shape, area } = product[kind];
  ctx.fillStyle = kind === 'phone' ? '#1c1d22' : '#ffffff';
  ctx.strokeStyle = '#c9ccd4';
  ctx.lineWidth = 6;
  shape();
  ctx.fill();
  ctx.stroke();
  const [x, y, areaWidth, areaHeight] = area;
  const scale = Math.min(areaWidth / art.width, areaHeight / art.height);
  const drawWidth = art.width * scale;
  const drawHeight = art.height * scale;
  ctx.drawImage(art, x + (areaWidth - drawWidth) / 2, y + (areaHeight - drawHeight) / 2, drawWidth, drawHeight);
  return canvasBlob(canvas);
};

// ---------- Audio ----------

// A WAV file from rendered audio.
const encodeWav = (buffer: AudioBuffer) => {
  const samples = buffer.getChannelData(0);
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const write = (offset: number, text: string) => [...text].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  write(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true));
  return new Blob([view], { type: 'audio/wav' });
};

const sampleRate = 22050;

// Notes of a scale the prompt picks, as frequencies.
const scaleFor = (prompt: string) => {
  const random = seededRandom(prompt);
  const root = 196 * 2 ** (Math.floor(random() * 7) / 12);
  const steps = /sad|calm|night|هادئ|حزين/i.test(prompt) ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  return steps.map((step) => root * 2 ** (step / 12));
};

// Plays the prompt's tune and beat into an audio graph (used for music, and for a video's sound).
const scheduleTune = (ctx: BaseAudioContext, destination: AudioNode, prompt: string, seconds: number) => {
  const random = seededRandom(`${prompt}:tune`);
  const notes = scaleFor(prompt);
  const tempo = /fast|upbeat|energetic|حيوي|سريع/i.test(prompt) ? 0.25 : 0.4;
  for (let time = 0; time < seconds; time += tempo) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = random() > 0.5 ? 'triangle' : 'sine';
    oscillator.frequency.value = notes[Math.floor(random() * notes.length)] * (random() > 0.8 ? 2 : 1);
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + tempo * 1.8);
    oscillator.connect(gain).connect(destination);
    oscillator.start(time);
    oscillator.stop(time + tempo * 2);
  }
  for (let time = 0; time < seconds; time += tempo * 2) {
    const kick = ctx.createOscillator();
    const gain = ctx.createGain();
    kick.frequency.setValueAtTime(120, time);
    kick.frequency.exponentialRampToValueAtTime(40, time + 0.15);
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    kick.connect(gain).connect(destination);
    kick.start(time);
    kick.stop(time + 0.25);
  }
};

export const makeMusic = async (prompt: string, seconds: number) => {
  const ctx = new OfflineAudioContext(1, sampleRate * seconds, sampleRate);
  scheduleTune(ctx, ctx.destination, prompt, seconds);
  return encodeWav(await ctx.startRendering());
};

// Sound effects: noise and tones shaped by the words in the prompt (whoosh, click, rain, beep…).
export const makeSoundEffect = async (prompt: string) => {
  const seconds = aiGeneration.soundEffectSeconds;
  const ctx = new OfflineAudioContext(1, sampleRate * seconds, sampleRate);
  const noise = ctx.createBuffer(1, sampleRate * seconds, sampleRate);
  const random = seededRandom(prompt);
  noise.getChannelData(0).forEach((_, index, data) => (data[index] = random() * 2 - 1));
  const source = ctx.createBufferSource();
  source.buffer = noise;
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  if (/rain|wind|مطر|رياح/i.test(prompt)) {
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    gain.gain.value = 0.4;
  } else {
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, 0);
    filter.frequency.exponentialRampToValueAtTime(4000, seconds * 0.6);
    gain.gain.setValueAtTime(0.001, 0);
    gain.gain.exponentialRampToValueAtTime(0.8, seconds * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, seconds);
  }
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  if (/beep|click|ding|bell|جرس|تنبيه/i.test(prompt)) {
    const tone = ctx.createOscillator();
    const toneGain = ctx.createGain();
    tone.frequency.value = 880;
    toneGain.gain.setValueAtTime(0.5, 0);
    toneGain.gain.exponentialRampToValueAtTime(0.001, 0.4);
    tone.connect(toneGain).connect(ctx.destination);
    tone.start();
    tone.stop(0.5);
  }
  return encodeWav(await ctx.startRendering());
};

// ---------- Voice-over ----------

const languageTags: Record<AiVoiceLanguage, string> = { ar: 'ar', en: 'en' };

// The browser's voice for a language, preferring the chosen type when its name says so.
export const voiceFor = (language: AiVoiceLanguage, type: AiVoiceType) => {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith(languageTags[language]));
  return voices.find((voice) => voice.name.toLowerCase().includes(type)) ?? voices[0] ?? null;
};

// Reads the text out with the browser's voices. Returns false when the browser can't speak.
export const speak = (text: string, language: AiVoiceLanguage, type: AiVoiceType, onEnd?: () => void) => {
  if (typeof speechSynthesis === 'undefined') return false;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
  const voice = voiceFor(language, type);
  if (voice) utterance.voice = voice;
  utterance.pitch = type === 'male' ? 0.8 : 1.15;
  utterance.onend = () => onEnd?.();
  speechSynthesis.speak(utterance);
  return true;
};

export const stopSpeaking = () => {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
};

// ---------- Video ----------

export interface VideoRequest {
  duration: number; // seconds
  aspect: AiAspectRatio;
  resolution: AiVideoResolution;
  audio: boolean;
  prompt: string;
  frames: [string | Blob, (string | Blob)?]; // the first frame, and the last when the video moves between two
  motion: 'pan' | 'zoom';
}

// How long to wait for the browser to start sound before recording a video without it.
const audioStartTimeoutMs = 1000;

// Records a short video in real time: the frames move (pan or zoom) and cross-fade, with the prompt's tune when sound is on.
export const makeVideo = async ({ duration, aspect, resolution, audio, prompt, frames, motion }: VideoRequest) => {
  const scale = aiVideoScale[resolution];
  const width = Math.round(aiOutputSizes[aspect].width * scale);
  const height = Math.round(aiOutputSizes[aspect].height * scale);
  const [first, last] = await Promise.all(frames.map((frame) => (frame ? imageCanvas(frame) : Promise.resolve(null))));
  if (!first) throw new Error('A first frame is needed');
  const canvas = blankCanvas(width, height);
  const ctx = context(canvas);
  const stream = canvas.captureStream(aiVideoFramesPerSecond);
  let audioContext: AudioContext | null = null;
  if (audio) {
    audioContext = new AudioContext();
    // The browser only lets sound start after the person has used the page; until then the context stays paused,
    // and recording a paused sound track gives an empty file. In that case the video is recorded without sound.
    await Promise.race([audioContext.resume(), new Promise((resolve) => setTimeout(resolve, audioStartTimeoutMs))]);
    if (audioContext.state === 'running') {
      const destination = audioContext.createMediaStreamDestination();
      scheduleTune(audioContext, destination, prompt, duration);
      destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    }
  }
  // With sound, the recorder needs the audio codec named as well as the video one.
  const withSound = stream.getAudioTracks().length > 0;
  const mimeType = (withSound ? ['video/webm;codecs=vp8,opus', 'video/webm'] : ['video/webm']).find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);
  const done = new Promise<Blob>((resolve) => (recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }))));

  const drawFrame = (image: HTMLCanvasElement, progress: number, alpha: number) => {
    const zoom = motion === 'zoom' ? 1 + 0.25 * progress : 1.2;
    const drawWidth = width * zoom;
    const drawHeight = height * zoom;
    const shift = motion === 'pan' ? (drawWidth - width) * progress : (drawWidth - width) / 2;
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, -shift, -(drawHeight - height) / 2, drawWidth, drawHeight);
    ctx.globalAlpha = 1;
  };

  recorder.start();
  const started = performance.now();
  await new Promise<void>((resolve) => {
    const step = () => {
      const progress = Math.min(1, (performance.now() - started) / (duration * 1000));
      drawFrame(first, progress, 1);
      if (last) drawFrame(last, progress, progress);
      if (progress < 1) requestAnimationFrame(step);
      else resolve();
    };
    step();
  });
  recorder.stop();
  const blob = await done;
  await audioContext?.close();
  return blob;
};
