import styles from './Field.module.css';

// The shared class for inputs, selects and textareas, so they all look the same.
export const fieldControlClassName = styles.control;

export const fieldHintId = (id: string) => `${id}-hint`;
export const fieldErrorId = (id: string) => `${id}-error`;

// The aria-describedby value for a control, so screen readers read its hint and error.
export const fieldDescribedBy = (id: string, hint?: string, error?: string) =>
  [hint && fieldHintId(id), error && fieldErrorId(id)].filter(Boolean).join(' ') || undefined;
