export type FieldMessageTone = 'hint' | 'error';

export interface FieldMessageProps {
  message?: string; // nothing is rendered without a message
  tone?: FieldMessageTone; // errors are announced to screen readers
  id?: string; // referenced by the field's aria-describedby
}
