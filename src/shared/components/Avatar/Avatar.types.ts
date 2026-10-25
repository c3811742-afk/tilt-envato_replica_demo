import type { AccentName } from '@/shared/theme';

export interface AvatarProps {
  name?: string; // its first letters are shown
  accent?: AccentName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
