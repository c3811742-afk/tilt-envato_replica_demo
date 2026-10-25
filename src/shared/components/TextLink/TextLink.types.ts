import type { ReactNode } from 'react';
import type { TextVariant } from '../Text';

export interface TextLinkProps {
  children?: ReactNode;
  to?: string; // app path (from routes.ts)
  href?: string; // external site, opened in a new tab
  variant?: TextVariant;
  color?: string;
  underline?: boolean;
  onClick?: () => void; // an action instead of a page: renders a button that looks like a link
  autoDirection?: boolean; // the link text is user content that may be in either language
  newTab?: boolean; // open an app page in a new tab, so the current page (e.g. a half-filled form) stays as it is
}
