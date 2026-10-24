import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type PointerEvent } from 'react';
import { Badge, Button, ChipGroup, FieldMessage, FileInput, Slider, Stack, Text } from '@/shared/components';
import { aiGeneration } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Generation } from '@/shared/types';
import { accountCredits, fillText, fitImage, formatNumber, planUsage, safeAsync } from '@/shared/utils';
import { drawnSource, useOutputUrl } from '@/features/common/components';
import styles from './AiToolPage.module.css';
import { sourceBlob, type ImageSource } from './imageSource';


// A single choice shown as chips (shape, style, length…).
export const ChoiceChips = <T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) => (
  <ChipGroup<T> label={label} value={[value]} onChange={(next) => next[0] && onChange(next[0])} options={options} />
);

// "Upload an image, or pick one of your results."
export const SourcePicker = ({ label, value, onChange }: { label: string; value: ImageSource | null; onChange: (source: ImageSource) => void }) => {
  const { text } = useLocale();
  const { session } = useSession();
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string>();
  const recent =
    session.status === 'signedIn'
      ? planUsage(session)
          .generations.filter((generation) => generation.outputs.some((output) => output.kind === 'image'))
          .slice(0, aiGeneration.recentSources)
      : [];

  const upload = async (file: File) => {
    setReading(true);
    const result = await safeAsync(() => fitImage(file));
    setReading(false);
    if (!result.ok) {
      setError(text.apiErrors.unsupportedFile);
      return;
    }
    setError(undefined);
    onChange({ kind: 'upload', blob: result.data, name: file.name, url: URL.createObjectURL(result.data) });
  };

  return (
    <Stack gap={vars.spacing[3]}>
      <Text as="span" variant="title">
        {label}
      </Text>
      {value && <SourcePreview source={value} />}
      <FileInput
        label={text.ai.sourceUpload}
        accept="image/*"
        icon="upload"
        variant="outline"
        busy={reading ? text.common.processing : undefined}
        error={error}
        onSelect={(file) => void upload(file)}
      />
      {recent.length > 0 && (
        <Stack gap={vars.spacing[2]}>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {text.ai.sourcePick}
          </Text>
          <Stack as="ul" direction="row" wrap gap={vars.spacing[2]}>
            {recent.flatMap((generation) =>
              generation.outputs.map((output, index) =>
                output.kind === 'image' ? (
                  <li key={`${generation.id}:${index}`}>
                    <button
                      type="button"
                      className={styles.thumbButton}
                      aria-pressed={value?.kind === 'result' && value.generation.id === generation.id && value.index === index}
                      onClick={() => onChange({ kind: 'result', generation, index })}
                    >
                      <ResultThumb generation={generation} index={index} />
                    </button>
                  </li>
                ) : null,
              ),
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

const ResultThumb = ({ generation, index }: { generation: Generation; index: number }) => {
  const url = useOutputUrl(generation, index);
  return url ? <img className={styles.thumb} src={url} alt={generation.prompt} /> : <span className={styles.thumb} />;
};

const SourcePreview = ({ source }: { source: ImageSource }) => {
  const url = source.kind === 'upload' ? source.url : null;
  return source.kind === 'upload' ? (
    <img className={styles.preview} src={url ?? ''} alt={source.name} />
  ) : (
    <ResultPreview generation={source.generation} index={source.index} />
  );
};

const ResultPreview = ({ generation, index }: { generation: Generation; index: number }) => {
  const url = useOutputUrl(generation, index) ?? drawnSource(generation, index);
  return <img className={styles.preview} src={url} alt={generation.prompt} />;
};

// What the user marked on the image: a mask the size of the image (marked pixels are opaque).
export interface MarkCanvasHandle {
  mask: () => HTMLCanvasElement | null; // null when nothing is marked
}

// Paints over an image (brush) or draws notes on it (annotate). For notes, the change goes in the area they cover.
export const MarkCanvas = forwardRef<MarkCanvasHandle, { source: ImageSource; mode: 'brush' | 'annotate' }>(({ source, mode }, ref) => {
  const { text } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [size, setSize] = useState<number>(aiGeneration.brushSize.initial);
  const [marked, setMarked] = useState(false);
  const drawing = useRef(false);

  // The image as a URL (an upload has one; a result is read as a file).
  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;
    void safeAsync(() => sourceBlob(source)).then((result) => {
      if (!result.ok) {
        console.error(result.error);
        return;
      }
      if (!active) return;
      objectUrl = URL.createObjectURL(result.data);
      setUrl(objectUrl);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  useImperativeHandle(ref, () => ({
    mask: () => {
      const canvas = canvasRef.current;
      if (!canvas || !marked) return null;
      if (mode === 'brush') return canvas;
      // Notes: the area they cover becomes the mask.
      const ctx = canvas.getContext('2d');
      const data = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
      if (!data) return null;
      let [left, top, right, bottom] = [canvas.width, canvas.height, 0, 0];
      for (let pixel = 0; pixel < data.length / 4; pixel += 1) {
        if (!data[pixel * 4 + 3]) continue;
        const x = pixel % canvas.width;
        const y = Math.floor(pixel / canvas.width);
        [left, top, right, bottom] = [Math.min(left, x), Math.min(top, y), Math.max(right, x), Math.max(bottom, y)];
      }
      const mask = document.createElement('canvas');
      mask.width = canvas.width;
      mask.height = canvas.height;
      const maskCtx = mask.getContext('2d');
      if (!maskCtx) return null;
      maskCtx.fillStyle = '#000';
      maskCtx.fillRect(left, top, right - left, bottom - top);
      return mask;
    },
  }));

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const box = canvas.getBoundingClientRect();
    return { x: ((event.clientX - box.left) / box.width) * canvas.width, y: ((event.clientY - box.top) / box.height) * canvas.height };
  };

  const draw = (event: PointerEvent<HTMLCanvasElement>, start = false) => {
    const ctx = event.currentTarget.getContext('2d');
    if (!ctx) return;
    const { x, y } = point(event);
    // The marks use the theme's highlight color, so they show in both light and dark mode.
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--colors-highlight');
    ctx.lineWidth = mode === 'brush' ? size : aiGeneration.annotationWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (start) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    setMarked(true);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setMarked(false);
  };

  return (
    <Stack gap={vars.spacing[2]}>
      {url && (
        <div className={styles.stage}>
          <img
            src={url}
            alt=""
            className={styles.stageImage}
            onLoad={(event) => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              canvas.width = event.currentTarget.naturalWidth;
              canvas.height = event.currentTarget.naturalHeight;
            }}
          />
          <canvas
            ref={canvasRef}
            className={styles.marks}
            aria-label={text.ai.canvasLabel}
            onPointerDown={(event) => {
              drawing.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              draw(event, true);
            }}
            onPointerMove={(event) => drawing.current && draw(event)}
            onPointerUp={() => (drawing.current = false)}
          />
        </div>
      )}
      <Stack direction="row" wrap align="center" gap={vars.spacing[4]}>
        {mode === 'brush' && (
          <Stack grow>
            <Slider
              label={text.ai.brushSize}
              showLabel
              value={size}
              min={aiGeneration.brushSize.min}
              max={aiGeneration.brushSize.max}
              step={aiGeneration.brushSize.step}
              onChange={setSize}
            />
          </Stack>
        )}
        <Button variant="outline" size="sm" disabled={!marked} onClick={clear}>
          {text.ai.clearMarks}
        </Button>
      </Stack>
    </Stack>
  );
});
MarkCanvas.displayName = 'MarkCanvas';

// The cost before generating, what's left, and the Generate button.
export const CostFooter = ({ credits, sending, error }: { credits: number; sending: boolean; error?: string }) => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const left = session.status === 'signedIn' ? accountCredits(session).remaining : 0;
  const tooMany = credits > left;
  return (
    <Stack gap={vars.spacing[2]}>
      <FieldMessage tone="error" message={error} />
      <Stack direction="row" wrap align="center" gap={vars.spacing[3]}>
        <Button type="submit" disabled={sending || tooMany}>
          {sending ? text.ai.generating : text.ai.generate}
        </Button>
        <Badge variant={tooMany ? 'neutral' : 'info'}>
          {fillText(text.ai.costBefore, { credits: formatNumber(credits, locale), left: formatNumber(left, locale) })}
        </Badge>
      </Stack>
      {tooMany && <Text variant="bodySm">{text.apiErrors.notEnoughCredits}</Text>}
    </Stack>
  );
};
