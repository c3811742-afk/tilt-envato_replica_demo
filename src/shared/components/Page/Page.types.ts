import type { ReactNode } from 'react';

export interface PageProps {
  children?: ReactNode;
  title?: string; // the page's <h1>
  subtitle?: string;
  headerContent?: ReactNode; // shown under the title (e.g. a result count)
  gap?: string; // space between the page's sections
  contentMaxWidth?: string; // narrower content for reading pages (e.g. FAQ) and forms
  centered?: boolean; // center the narrow content (sign-in and other forms)
  showBack?: boolean; // the "‹ Back" link above the title; off only for the home page
  backTo?: string; // where Back goes when the page has a clear parent (e.g. a collection); otherwise the previous page
  backLabel?: string; // e.g. "All my collections" with backTo; defaults to "Back"
}
