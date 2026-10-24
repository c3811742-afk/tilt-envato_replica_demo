import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button, Checkbox, FileInput, IconNote, OptionCardGroup, Stack, Text, TextField } from '@/shared/components';
import {
  aiGeneration,
  aiModelCredits,
  aiModels,
  aiVideoModelCredits,
  aiVideoModels,
  type AiAspectRatio,
  type AiEditMode,
  type AiGraphicKind,
  type AiModelId,
  type AiMockupKind,
  type AiOperation,
  type AiRelightDirection,
  type AiStyle,
  type AiVideoModelId,
  type AiVideoResolution,
  type AiVideoSource,
  type AiVoiceLanguage,
  type AiVoiceType,
} from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { AiRequest } from '@/shared/types';
import {
  aiApi,
  averageColor,
  editImage,
  eraseArea,
  fillText,
  formatCount,
  fitImage,
  formatNumber,
  generatedImage,
  generationCost,
  isApiError,
  makeMockup,
  makeMusic,
  makeSoundEffect,
  makeVideo,
  newSeed,
  relightImage,
  removeBackground,
  safeAsync,
  swapBackground,
  upscaleImage,
  voiceFor,
  type CreditAllowance,
  type GeneratedFile,
} from '@/shared/utils';
import { sourceBlob, sourceName, type ImageSource } from './imageSource';
import { ChoiceChips, CostFooter, MarkCanvas, SourcePicker, type MarkCanvasHandle } from './ToolParts';

// Sends a request: first the browser makes any files (an edited image, a video, music), then the request spends credits.
const useGenerate = () => {
  const { text } = useLocale();
  const { setAccount } = useSession();
  const { requestError } = useMessages();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();

  const run = async (request: AiRequest, make?: () => Promise<GeneratedFile[]>) => {
    setSending(true);
    const result = await safeAsync(async () => aiApi.generate({ request, files: make ? await make() : [] }));
    setSending(false);
    // A server answer (no credits, model not in the plan) is explained; anything else is a generic failure.
    setError(result.ok ? undefined : isApiError(result.error) ? requestError(result.error) : text.ai.failed);
    if (result.ok) setAccount(result.data);
  };
  return { sending, error, setError, run };
};

const ToolForm = ({ onSubmit, children }: { onSubmit: () => void; children: ReactNode }) => (
  <Stack
    as="form"
    gap={vars.spacing[5]}
    onSubmit={(event: FormEvent) => {
      event.preventDefault();
      onSubmit();
    }}
    noValidate
  >
    {children}
  </Stack>
);

const aspectOptions = (text: ReturnType<typeof useLocale>['text']) => aiGeneration.aspectRatios.map((aspect) => ({ value: aspect, label: text.ai.aspects[aspect] }));

// ---------- Images and graphics ----------

export const ImageForm = ({ tool, allowance }: { tool: 'image' | 'graphics'; allowance: CreditAllowance }) => {
  const { text, locale } = useLocale();
  const { sending, error, setError, run } = useGenerate();
  const [prompt, setPrompt] = useState('');
  const [promptError, setPromptError] = useState<string>();
  const [model, setModel] = useState<AiModelId>(allowance.models[allowance.models.length - 1] ?? aiModels[0]);
  const [style, setStyle] = useState<AiStyle>(aiGeneration.styles[0]);
  const [aspect, setAspect] = useState<AiAspectRatio>(aiGeneration.aspectRatios[0]);
  const [count, setCount] = useState<number>(aiGeneration.imageCounts[0]);
  const [burst, setBurst] = useState(false);
  const [kind, setKind] = useState<AiGraphicKind>(aiGeneration.graphicKinds[0]);
  const [reference, setReference] = useState<{ name: string; tint: string } | null>(null);
  const request: AiRequest =
    tool === 'image'
      ? { tool, prompt, model: burst ? aiModels[0] : model, style, aspect, count, burst, tint: reference?.tint, sourceName: reference?.name }
      : { tool, prompt, kind, count, tint: reference?.tint };

  const addReference = async (file: File) => {
    const result = await safeAsync(async () => {
      const fitted = await fitImage(file);
      return { name: file.name, tint: await averageColor(fitted) };
    });
    setError(result.ok ? undefined : text.apiErrors.unsupportedFile);
    if (result.ok) setReference(result.data);
  };

  return (
    <ToolForm
      onSubmit={() => {
        if (!prompt.trim()) {
          setPromptError(text.ai.promptRequired);
          return;
        }
        setPromptError(undefined);
        void run(request);
      }}
    >
      <TextField
        label={text.ai.prompt}
        placeholder={text.ai.promptPlaceholder}
        value={prompt}
        onChange={setPrompt}
        rows={3}
        maxLength={aiGeneration.promptMaxLength}
        error={promptError}
      />
      {tool === 'image' ? (
        <>
          <OptionCardGroup<AiModelId>
            label={text.ai.model}
            value={model}
            onChange={setModel}
            options={aiModels.map((option) => ({
              value: option,
              title: option === aiModels[aiModels.length - 1] ? `${text.ai.models[option]} (${text.ai.newest})` : text.ai.models[option],
              description: formatCount(text.ai.modelCost, aiModelCredits[option], locale),
              disabled: !allowance.models.includes(option),
              disabledReason: text.ai.modelLocked,
            }))}
          />
          <ChoiceChips label={text.ai.style} value={style} onChange={setStyle} options={aiGeneration.styles.map((option) => ({ value: option, label: text.ai.styles[option] }))} />
          <ChoiceChips label={text.ai.aspect} value={aspect} onChange={setAspect} options={aspectOptions(text)} />
        </>
      ) : (
        <ChoiceChips
          label={text.ai.graphicKind}
          value={kind}
          onChange={setKind}
          options={aiGeneration.graphicKinds.map((option) => ({ value: option, label: text.ai.graphicKinds[option] }))}
        />
      )}
      {!burst && (
        <ChoiceChips
          label={text.ai.count}
          value={String(count)}
          onChange={(value) => setCount(Number(value))}
          options={aiGeneration.imageCounts.map((option) => ({ value: String(option), label: formatNumber(option, locale) }))}
        />
      )}
      {tool === 'image' && (
        <Checkbox label={fillText(text.ai.burst, { count: formatNumber(aiGeneration.burstCount, locale) })} checked={burst} onChange={setBurst} />
      )}
      <Stack gap={vars.spacing[2]}>
        <Text as="span" variant="title">
          {text.ai.reference}
        </Text>
        {reference ? (
          <Stack direction="row" align="center" gap={vars.spacing[3]}>
            <Text variant="bodySm" autoDirection>
              {reference.name}
            </Text>
            <Button variant="outline" size="sm" onClick={() => setReference(null)}>
              {text.ai.remove}
            </Button>
          </Stack>
        ) : (
          <FileInput label={text.ai.referenceUpload} accept="image/*" icon="image" variant="outline" hint={text.ai.referenceHint} onSelect={(file) => void addReference(file)} />
        )}
      </Stack>
      <CostFooter credits={generationCost(request)} sending={sending} error={error} />
    </ToolForm>
  );
};

// ---------- Mockups ----------

export const MockupForm = ({ source, onSource }: { source: ImageSource | null; onSource: (source: ImageSource) => void }) => {
  const { text } = useLocale();
  const { sending, error, setError, run } = useGenerate();
  const [kind, setKind] = useState<AiMockupKind>(aiGeneration.mockupKinds[0]);
  const request: AiRequest = { tool: 'mockup', prompt: '', kind, sourceName: source ? sourceName(source) : undefined };

  return (
    <ToolForm
      onSubmit={() => {
        if (!source) {
          setError(text.ai.sourceRequired);
          return;
        }
        void run(request, async () => [{ kind: 'image', blob: await makeMockup(await sourceBlob(source), kind) }]);
      }}
    >
      <SourcePicker label={text.ai.source} value={source} onChange={onSource} />
      <ChoiceChips
        label={text.ai.mockupKind}
        value={kind}
        onChange={setKind}
        options={aiGeneration.mockupKinds.map((option) => ({ value: option, label: text.ai.mockupKinds[option] }))}
      />
      <CostFooter credits={generationCost(request)} sending={sending} error={error} />
    </ToolForm>
  );
};

// ---------- Edits ----------

type EditTool = Extract<AiOperation, 'edit' | 'backgroundRemove' | 'erase' | 'upscale' | 'relight' | 'backgroundSwap'>;

export const EditForm = ({ tool, source, onSource }: { tool: EditTool; source: ImageSource | null; onSource: (source: ImageSource) => void }) => {
  const { text } = useLocale();
  const { sending, error, setError, run } = useGenerate();
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<AiEditMode>(aiGeneration.editModes[0]);
  const [direction, setDirection] = useState<AiRelightDirection>(aiGeneration.relightDirections[0]);
  const marks = useRef<MarkCanvasHandle>(null);
  const needsPrompt = tool === 'edit' || tool === 'backgroundSwap';
  const needsMarks = tool === 'erase' || (tool === 'edit' && mode !== 'prompt');
  const request: AiRequest = {
    tool,
    prompt,
    kind: tool === 'edit' ? mode : tool === 'relight' ? direction : undefined,
    sourceName: source ? sourceName(source) : undefined,
  };

  const submit = () => {
    if (!source) {
      setError(text.ai.sourceRequired);
      return;
    }
    if (needsPrompt && !prompt.trim()) {
      setError(text.ai.promptRequired);
      return;
    }
    const mask = marks.current?.mask() ?? null;
    if (needsMarks && !mask) {
      setError(text.ai.marksRequired);
      return;
    }
    void run(request, async () => {
      const image = await sourceBlob(source);
      const made = await {
        edit: () => editImage(image, prompt, mask),
        backgroundRemove: () => removeBackground(image),
        erase: () => eraseArea(image, mask ?? document.createElement('canvas')),
        upscale: () => upscaleImage(image),
        relight: () => relightImage(image, direction),
        backgroundSwap: () => swapBackground(image, generatedImage({ prompt, seed: prompt.length, aspect: 'square' }, 0)),
      }[tool]();
      return [{ kind: 'image', blob: made }];
    });
  };

  return (
    <ToolForm onSubmit={submit}>
      <SourcePicker label={text.ai.source} value={source} onChange={onSource} />
      {tool === 'edit' && (
        <ChoiceChips label={text.ai.editMode} value={mode} onChange={setMode} options={aiGeneration.editModes.map((option) => ({ value: option, label: text.ai.editModes[option] }))} />
      )}
      {tool === 'edit' && <Text variant="bodySm" color={vars.colors.textMuted}>{text.ai.editModeHints[mode]}</Text>}
      {tool === 'erase' && <Text variant="bodySm" color={vars.colors.textMuted}>{text.ai.eraseHint}</Text>}
      {source && needsMarks && <MarkCanvas ref={marks} source={source} mode={tool === 'edit' && mode === 'annotate' ? 'annotate' : 'brush'} />}
      {tool === 'relight' && (
        <ChoiceChips
          label={text.ai.relightDirection}
          value={direction}
          onChange={setDirection}
          options={aiGeneration.relightDirections.map((option) => ({ value: option, label: text.ai.relightDirections[option] }))}
        />
      )}
      {needsPrompt && (
        <TextField
          label={tool === 'edit' ? text.ai.editPrompt : text.ai.backgroundPrompt}
          placeholder={tool === 'edit' ? text.ai.editPromptPlaceholder : text.ai.backgroundPromptPlaceholder}
          value={prompt}
          onChange={setPrompt}
          maxLength={aiGeneration.promptMaxLength}
        />
      )}
      <CostFooter credits={generationCost(request)} sending={sending} error={error} />
    </ToolForm>
  );
};

// ---------- Video ----------

export const VideoForm = ({
  tool,
  allowance,
  source,
  onSource,
}: {
  tool: 'video' | 'cameraMotion';
  allowance: CreditAllowance;
  source: ImageSource | null;
  onSource: (source: ImageSource) => void;
}) => {
  const { text, locale } = useLocale();
  const { sending, error, setError, run } = useGenerate();
  const [from, setFrom] = useState<AiVideoSource>(source ? 'frames' : aiGeneration.videoSources[0]);
  const [prompt, setPrompt] = useState('');
  const [end, setEnd] = useState<ImageSource | null>(null);
  const [model, setModel] = useState<AiVideoModelId>(allowance.videoModels[allowance.videoModels.length - 1] ?? aiVideoModels[0]);
  const [aspect, setAspect] = useState<AiAspectRatio>(aiGeneration.aspectRatios[1]);
  const [duration, setDuration] = useState<number>(aiGeneration.videoDurations[0]);
  const [resolution, setResolution] = useState<AiVideoResolution>(aiGeneration.videoResolutions[0]);
  const [audio, setAudio] = useState(false);
  const motionOnly = tool === 'cameraMotion';
  const seconds = motionOnly ? aiGeneration.videoDurations[1] : duration;
  const request: AiRequest = motionOnly
    ? { tool, prompt: '', aspect, duration: seconds, sourceName: source ? sourceName(source) : undefined }
    : { tool, prompt, model, aspect, duration, resolution, audio, sourceName: from === 'frames' && source ? sourceName(source) : undefined };

  const submit = () => {
    if ((motionOnly || from === 'frames') && !source) {
      setError(text.ai.sourceRequired);
      return;
    }
    if (!motionOnly && from === 'text' && !prompt.trim()) {
      setError(text.ai.promptRequired);
      return;
    }
    const seed = newSeed();
    void run(request, async () => {
      const frames: [string | Blob, (string | Blob)?] =
        !motionOnly && from === 'text'
          ? [generatedImage({ prompt, seed, aspect }, 0), generatedImage({ prompt, seed, aspect }, 1)]
          : [await sourceBlob(source as ImageSource), end ? await sourceBlob(end) : undefined];
      const blob = await makeVideo({
        duration: seconds,
        aspect,
        resolution: motionOnly ? aiGeneration.videoResolutions[0] : resolution,
        audio: !motionOnly && audio,
        prompt,
        frames,
        motion: motionOnly ? 'zoom' : 'pan',
      });
      return [{ kind: 'video', blob }];
    });
  };

  return (
    <ToolForm onSubmit={submit}>
      {!motionOnly && (
        <ChoiceChips
          label={text.ai.videoSource}
          value={from}
          onChange={setFrom}
          options={aiGeneration.videoSources.map((option) => ({ value: option, label: text.ai.videoSources[option] }))}
        />
      )}
      {motionOnly || from === 'frames' ? (
        <>
          <SourcePicker label={motionOnly ? text.ai.source : text.ai.startFrame} value={source} onChange={onSource} />
          {!motionOnly && <SourcePicker label={text.ai.endFrame} value={end} onChange={setEnd} />}
        </>
      ) : (
        <TextField label={text.ai.prompt} placeholder={text.ai.promptPlaceholder} value={prompt} onChange={setPrompt} rows={3} maxLength={aiGeneration.promptMaxLength} />
      )}
      {!motionOnly && (
        <OptionCardGroup<AiVideoModelId>
          label={text.ai.model}
          value={model}
          onChange={setModel}
          options={aiVideoModels.map((option) => ({
            value: option,
            title: option === aiVideoModels[aiVideoModels.length - 1] ? `${text.ai.models[option]} (${text.ai.newest})` : text.ai.models[option],
            description: fillText(text.ai.videoModelCost, { credits: formatNumber(aiVideoModelCredits[option], locale) }),
            disabled: !allowance.videoModels.includes(option),
            disabledReason: text.ai.modelLocked,
          }))}
        />
      )}
      <ChoiceChips label={text.ai.aspect} value={aspect} onChange={setAspect} options={aspectOptions(text)} />
      {!motionOnly && (
        <>
          <ChoiceChips
            label={text.ai.duration}
            value={String(duration)}
            onChange={(value) => setDuration(Number(value))}
            options={aiGeneration.videoDurations.map((option) => ({ value: String(option), label: fillText(text.ai.seconds, { count: formatNumber(option, locale) }) }))}
          />
          <ChoiceChips
            label={text.ai.resolution}
            value={resolution}
            onChange={setResolution}
            options={aiGeneration.videoResolutions.map((option) => ({ value: option, label: option }))}
          />
          <Checkbox label={text.ai.audio} checked={audio} onChange={setAudio} />
        </>
      )}
      <CostFooter credits={generationCost(request)} sending={sending} error={error} />
    </ToolForm>
  );
};

// ---------- Audio ----------

export const AudioForm = ({ tool }: { tool: 'music' | 'voice' | 'soundEffect' }) => {
  const { text, locale } = useLocale();
  const { sending, error, setError, run } = useGenerate();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<number>(aiGeneration.musicDurations[0]);
  const [language, setLanguage] = useState<AiVoiceLanguage>(locale);
  const [voice, setVoice] = useState<AiVoiceType>(aiGeneration.voiceTypes[0]);
  const request: AiRequest =
    tool === 'music' ? { tool, prompt, duration } : tool === 'voice' ? { tool, prompt, language, voice } : { tool, prompt, duration: aiGeneration.soundEffectSeconds };

  const submit = () => {
    if (!prompt.trim()) {
      setError(tool === 'voice' ? text.ai.voiceRequired : text.ai.promptRequired);
      return;
    }
    if (tool === 'voice') {
      void run(request);
      return;
    }
    void run(request, async () => [{ kind: 'audio', blob: tool === 'music' ? await makeMusic(prompt, duration) : await makeSoundEffect(prompt) }]);
  };

  return (
    <ToolForm onSubmit={submit}>
      <TextField
        label={tool === 'voice' ? text.ai.voiceText : text.ai.prompt}
        placeholder={tool === 'voice' ? text.ai.voicePlaceholder : text.ai.promptPlaceholder}
        value={prompt}
        onChange={setPrompt}
        rows={tool === 'voice' ? 5 : 3}
        maxLength={tool === 'voice' ? aiGeneration.voiceMaxLength : aiGeneration.promptMaxLength}
      />
      {tool === 'music' && (
        <ChoiceChips
          label={text.ai.duration}
          value={String(duration)}
          onChange={(value) => setDuration(Number(value))}
          options={aiGeneration.musicDurations.map((option) => ({ value: String(option), label: fillText(text.ai.seconds, { count: formatNumber(option, locale) }) }))}
        />
      )}
      {tool === 'voice' && (
        <>
          <ChoiceChips
            label={text.ai.language}
            value={language}
            onChange={setLanguage}
            options={aiGeneration.voiceLanguages.map((option) => ({ value: option, label: text.ai.languages[option] }))}
          />
          <ChoiceChips label={text.ai.voiceType} value={voice} onChange={setVoice} options={aiGeneration.voiceTypes.map((option) => ({ value: option, label: text.ai.voiceTypes[option] }))} />
          {!voiceFor(language, voice) && <IconNote text={text.ai.noVoice} />}
        </>
      )}
      <CostFooter credits={generationCost(request)} sending={sending} error={error} />
    </ToolForm>
  );
};
