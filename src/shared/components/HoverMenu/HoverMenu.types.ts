import type { ReactNode } from 'react';

export interface HoverMenuProps {
  trigger?: ReactNode; // what the menu hangs from, usually a nav link (it stays clickable)
  label?: string; // accessible name of the panel
  children?: ReactNode | ((close: () => void) => ReactNode); // the panel; call `close` after an action
  width?: string; // of the panel
  align?: 'start' | 'end'; // which edge of the trigger the panel lines up with (mirrors in Arabic)
  closeDelayMs?: number; // how long the panel waits after the pointer leaves, so a diagonal move doesn't close it
}
