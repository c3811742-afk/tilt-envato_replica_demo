import type { TextAlignment } from '@/shared/constants';

export interface FontPreviewSettings {
  text: string; // empty: each font shows its sample sentence
  size: number; // rem
  align: TextAlignment;
}

export interface FontPreviewControlsProps {
  value?: FontPreviewSettings; // the text, size and alignment (fontPreviewDefaults when not given)
  onChange?: (value: FontPreviewSettings) => void;
}
