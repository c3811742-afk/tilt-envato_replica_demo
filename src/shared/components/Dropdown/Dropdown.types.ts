import type { ReactNode } from 'react';

export interface DropdownProps {
  trigger?: ReactNode; // what the toggle button shows (e.g. an icon and the user's name)
  label?: string; // accessible name of the toggle button
  children?: ReactNode | ((close: () => void) => ReactNode); // the panel; call `close` after an action
  width?: string; // of the panel
  triggerHeight?: string; // matches the buttons next to it
}
