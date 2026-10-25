import type { IconName } from '@/shared/assets';

// AI image models, oldest first. Each plan includes some of them; newer models cost more credits per image.
export const aiModels = ['tiltImage1', 'tiltImage2', 'tiltImage2Pro'] as const;
export type AiModelId = (typeof aiModels)[number];
export const aiModelCredits: Record<AiModelId, number> = {
  tiltImage1: 1,
  tiltImage2: 2,
  tiltImage2Pro: 4,
};

// AI video models, oldest first, and what each costs per second of video.
export const aiVideoModels = ['tiltMotion1', 'tiltMotion2'] as const;
export type AiVideoModelId = (typeof aiVideoModels)[number];
export const aiVideoModelCredits: Record<AiVideoModelId, number> = {
  tiltMotion1: 2,
  tiltMotion2: 4,
};

// The AI Studio tools, grouped as in the AI hub.
export const aiToolGroups = {
  image: ['image', 'graphics', 'mockup'],
  edit: ['edit', 'backgroundRemove', 'erase', 'upscale'],
  video: ['video'],
  audio: ['music', 'voice', 'soundEffect'],
} as const;
export type AiToolGroup = keyof typeof aiToolGroups;
export const aiToolGroupKeys = Object.keys(aiToolGroups) as AiToolGroup[];
export const aiTools = Object.values(aiToolGroups).flat();
export type AiTool = (typeof aiToolGroups)[AiToolGroup][number];

// One-click actions on an image result.
export const aiShortcuts = ['relight', 'backgroundSwap', 'cameraMotion'] as const;
export type AiShortcut = (typeof aiShortcuts)[number];

// Everything that makes a generation: a tool, or a shortcut on an earlier result.
export type AiOperation = AiTool | AiShortcut;

export const aiShortcutIcons: Record<AiShortcut, IconName> = { relight: 'sun', backgroundSwap: 'image', cameraMotion: 'video' };

export const aiToolIcons: Record<AiTool, IconName> = {
  image: 'image',
  graphics: 'shapes',
  mockup: 'layout',
  edit: 'pencil',
  backgroundRemove: 'layers',
  erase: 'close',
  upscale: 'fullscreen',
  video: 'film',
  music: 'music',
  voice: 'message',
  soundEffect: 'waves',
};

// Tools that work on an image the user picks (an upload or an earlier result).
export const aiImageInputTools: readonly AiOperation[] = ['mockup', 'edit', 'backgroundRemove', 'erase', 'upscale', 'relight', 'backgroundSwap', 'cameraMotion'];

// The choices each tool offers, and limits.
export const aiGeneration = {
  imageCounts: [1, 2, 4],
  aspectRatios: ['square', 'landscape', 'portrait'],
  styles: ['photo', 'illustration', 'threeD', 'flat', 'watercolor', 'neon'],
  burstCount: 4, // burst mode: this many variations of one image
  graphicKinds: ['icon', 'pattern', 'badge'],
  mockupKinds: ['tshirt', 'phone', 'poster', 'mug'],
  editModes: ['prompt', 'annotate', 'brush'],
  relightDirections: ['left', 'top', 'right'],
  videoSources: ['text', 'frames'],
  videoDurations: [3, 5, 8], // seconds
  videoResolutions: ['720p', '1080p'],
  musicDurations: [10, 20, 30], // seconds
  voiceLanguages: ['ar', 'en'],
  voiceTypes: ['female', 'male'],
  soundEffectSeconds: 2,
  baseSeconds: 4, // how long a demo request takes in the queue
  secondsPerImage: 1.5,
  promptMaxLength: 400,
  voiceMaxLength: 500,
  referenceMaxBytes: 10 * 1024 * 1024,
  maxInputSize: 1024, // uploaded images are scaled down to fit this (canvas pixels)
  brushSize: { min: 8, max: 80, step: 4, initial: 32 }, // canvas pixels
  annotationWidth: 6,
  recentSources: 8, // earlier results offered as an image to work on
} as const;
export type AiAspectRatio = (typeof aiGeneration.aspectRatios)[number];
export type AiStyle = (typeof aiGeneration.styles)[number];
export type AiGraphicKind = (typeof aiGeneration.graphicKinds)[number];
export type AiMockupKind = (typeof aiGeneration.mockupKinds)[number];
export type AiEditMode = (typeof aiGeneration.editModes)[number];
export type AiRelightDirection = (typeof aiGeneration.relightDirections)[number];
export type AiVideoSource = (typeof aiGeneration.videoSources)[number];
export type AiVideoResolution = (typeof aiGeneration.videoResolutions)[number];
export type AiVoiceLanguage = (typeof aiGeneration.voiceLanguages)[number];
export type AiVoiceType = (typeof aiGeneration.voiceTypes)[number];

// Credits for the tools that don't depend on a model.
export const aiCredits = {
  burst: 1, // all the variations together
  graphics: 2,
  mockup: 2,
  edit: 2,
  backgroundRemove: 1,
  erase: 1,
  upscale: 2,
  relight: 1,
  backgroundSwap: 2,
  cameraMotion: 5,
  videoHighResolutionPerSecond: 1, // 1080p, on top of the model
  videoAudioPerSecond: 1,
  musicPerTenSeconds: 1,
  voicePerHundredCharacters: 1,
  soundEffect: 1,
} as const;

// Pixel sizes of generated images and videos (canvas units, not CSS sizes), by shape.
export const aiOutputSizes: Record<AiAspectRatio, { width: number; height: number }> = {
  square: { width: 512, height: 512 },
  landscape: { width: 640, height: 384 },
  portrait: { width: 384, height: 640 },
};
export const aiVideoScale: Record<AiVideoResolution, number> = { '720p': 1, '1080p': 1.5 };
export const aiVideoFramesPerSecond = 24;
export const aiUpscaleFactor = 2;

// What a license for AI-generated content says (license certificates are printed in the item's own words).
export const aiLicense = {
  itemPrefix: 'ai:', // license item ids for generated content
  creatorName: 'TILT AI Studio',
  projectName: 'AI Studio',
} as const;
