import type { ReactNode } from 'react';

export interface FieldProps {
  label: string;
  id?: string; // id of the control inside; links the label, hint and error to it
  children?: ReactNode; // the control: <input>, <select>, <textarea>, or checkboxes when `group` is on
  hint?: string;
  error?: string; // shown under the control, in place of nothing
  hideLabel?: boolean; // the control then carries the label as aria-label
  group?: boolean; // a group of controls (e.g. checkboxes): renders a <fieldset> and <legend>
  gap?: string;
}
