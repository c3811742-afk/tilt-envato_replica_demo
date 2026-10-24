import type { ReactNode } from 'react';

export interface PageProps {
  children?: ReactNode;
  title?: string; // the page's <h1>
  subtitle?: string;
  headerContent?: ReactNode; // shown under the title (e.g. a result count)
  gap?: string; // space between the page's sections
  contentMaxWidth?: string; // narrower content for reading pages (e.g. FAQ) and forms
  centered?: boolean; // center the narrow content (sign-in and other forms)
}
