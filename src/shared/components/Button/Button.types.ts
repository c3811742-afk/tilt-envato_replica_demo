import type { MouseEventHandler, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'muted' | 'highlight' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  background?: string; // overrides the variant's background
  color?: string; // overrides the variant's text color
  radius?: string;
  fullWidth?: boolean;
  iconOnly?: boolean; // tight padding for a button that shows an icon (and maybe a count), not a label
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  to?: string; // renders a router link to this app path (from routes.ts) instead of a button
  href?: string; // renders a link to an external site, opened in a new tab
  ariaLabel?: string; // accessible name when the button only shows an icon
  tooltip?: string; // an icon button's label, shown under it on hover and keyboard focus (also its accessible name)
  tooltipAlign?: 'center' | 'end'; // 'end' for a button at the end of a row, so the label stays on screen
  pressed?: boolean; // a toggle button that is on (e.g. Saved)
  onClick?: MouseEventHandler<HTMLElement>;
}
