import type { ReactNode } from 'react';

export type MediaKind = 'image' | 'video' | 'audio';

export interface MediaPreviewProps {
  kind?: MediaKind;
  src?: string; // no src, or a file that fails to load, shows the placeholder
  alt?: string; // describes the media for screen readers
  aspectRatio?: string;
  background?: string;
  fit?: 'contain' | 'cover'; // contain: the whole picture shows; cover: it fills the box (a tile)
  border?: boolean; // off inside a card that already has one
  placeholder?: ReactNode; // shown with nothing to play (e.g. the file type's icon); defaults to "No preview available"
}
