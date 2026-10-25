import type { PlaybackStatus } from '@/shared/utils';

export interface PlayButtonProps {
  status?: PlaybackStatus; // shows a spinner while loading and "pause" while playing
  label?: string; // accessible name, e.g. "Play Oud Dreams"
  title?: string; // tooltip, e.g. "Play"
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'surface'; // filled with the brand color, or plain until hovered
}
