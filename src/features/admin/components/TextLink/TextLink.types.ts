import type { ReactNode } from 'react';

export interface TextLinkProps {
  to: string; // a path from routes.ts (or built from one with generatePath)
  children?: ReactNode;
  color?: string;
  autoDirection?: boolean; // for link text written by users (e.g. an element title)
}
