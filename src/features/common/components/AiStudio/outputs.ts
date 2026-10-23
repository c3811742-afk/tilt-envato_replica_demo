import { useEffect, useState } from 'react';
import { aiShortcuts, type AiGraphicKind, type AiOperation, type AiShortcut, type Text } from '@/shared/constants';
import type { Generation } from '@/shared/types';
import { canvasBlob, fileStore, generatedGraphic, generatedImage, imageCanvas, safeAsync, toFileName } from '@/shared/utils';

// An AI result is drawn from its request (images, graphics) or kept as a file in the browser (edits, video, audio).

const fileExtensions: Record<string, string> = { 'image/png': 'png', 'video/webm': 'webm', 'audio/wav': 'wav' };

// The picture for a drawn result.
export const drawnSource = (generation: Generation, index: number) =>
  generation.tool === 'graphics'
    ? generatedGraphic({ ...generation, kind: (generation.kind ?? 'icon') as AiGraphicKind }, index)
    : generatedImage(generation, index);

// A result as a file: drawn ones become PNG images.
export const outputBlob = async (generation: Generation, index: number): Promise<Blob> => {
  const output = generation.outputs[index];
  if (output.fileId) {
    const file = await fileStore.get(output.fileId);
    if (!file) throw new Error('The file is no longer in this browser');
    return file;
  }
  return canvasBlob(await imageCanvas(drawnSource(generation, index)));
};

export const outputFileName = (generation: Generation, index: number, blob: Blob) =>
  `${toFileName((generation.prompt || generation.tool).slice(0, 40))}-${index + 1}.${fileExtensions[blob.type] ?? 'bin'}`;

// A URL to show a result: drawn ones right away, stored ones once read from the browser's file store.
// null while loading, or when the file is missing (e.g. site data was cleared).
export const useOutputUrl = (generation: Generation, index: number) => {
  const output = generation.outputs[index];
  const [stored, setStored] = useState<string | null>(null);

  useEffect(() => {
    if (!output?.fileId) return;
    let objectUrl: string | null = null;
    let active = true;
    void safeAsync(() => fileStore.get(output.fileId ?? '')).then((result) => {
      if (!result.ok) console.error(result.error);
      if (!active || !result.ok || !result.data) return;
      objectUrl = URL.createObjectURL(result.data);
      setStored(objectUrl);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [output?.fileId]);

  if (!output) return null;
  if (output.kind === 'image' && !output.fileId) return drawnSource(generation, index);
  return stored;
};

// "genId:index", how a result is passed to another tool (e.g. edit this image).
export const outputRef = (generation: Generation, index: number) => `${generation.id}:${index}`;

export const findOutput = (generations: Generation[], ref: string | null) => {
  if (!ref) return null;
  const [id, index] = ref.split(':');
  const generation = generations.find((candidate) => candidate.id === id);
  const position = Number(index);
  return generation && generation.outputs[position]?.kind === 'image' ? { generation, index: position } : null;
};

const isShortcut = (operation: AiOperation): operation is AiShortcut => (aiShortcuts as readonly string[]).includes(operation);

// A tool's or quick edit's name in the active language.
export const operationName = (text: Text, operation: AiOperation) => (isShortcut(operation) ? text.ai.shortcuts[operation] : text.ai.tools[operation].name);
