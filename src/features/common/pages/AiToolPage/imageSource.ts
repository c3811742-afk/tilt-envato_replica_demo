import type { Generation } from '@/shared/types';
import { outputBlob } from '@/features/common/components';

// An image a tool works on: one the user uploaded, or one of their earlier results.
export type ImageSource = { kind: 'upload'; blob: Blob; name: string; url: string } | { kind: 'result'; generation: Generation; index: number };

export const sourceBlob = (source: ImageSource) => (source.kind === 'upload' ? Promise.resolve(source.blob) : outputBlob(source.generation, source.index));

export const sourceName = (source: ImageSource) => (source.kind === 'upload' ? source.name : source.generation.prompt);
