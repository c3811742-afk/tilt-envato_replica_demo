export type MediaKind = 'image' | 'video' | 'audio';

export interface MediaPreviewProps {
  kind?: MediaKind;
  src?: string; // no src, or a file that fails to load, shows the placeholder
  alt?: string; // describes the media for screen readers
  aspectRatio?: string;
  background?: string;
  emptyLabel?: string; // defaults to "No preview available" in the active language
}
