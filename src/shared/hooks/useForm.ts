import { useRef, useState, type FormEvent } from 'react';
import { safeAsync, type FieldError } from '@/shared/utils';
import { useMessages } from './useMessages';

type Validators<T> = { [K in keyof T]?: (value: T[K], values: T) => FieldError | null };
type FieldErrors<T> = Partial<Record<keyof T, FieldError>>;

// Form state shared by every form: values, validation before submit, a busy flag while the request runs
// (so it can't be sent twice), and the request's error. What the user typed is always kept.
export const useForm = <T extends object>(initialValues: T, validators: Validators<T> = {}) => {
  const { fieldError } = useMessages();
  const [values, setValues] = useState(initialValues);
  // The latest values, so several changes in a row (e.g. autofill) build on each other instead of the last render.
  const latest = useRef(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<unknown>(null);

  const validate = (name: keyof T, current: T) => validators[name]?.(current[name], current) ?? undefined;

  // Updates one field, with a value or with a function of its latest value (for objects and lists).
  // A field that already shows an error is checked again as the user fixes it.
  const setValue = <K extends keyof T>(name: K, value: T[K] | ((current: T[K]) => T[K])) => {
    const resolved = typeof value === 'function' ? (value as (current: T[K]) => T[K])(latest.current[name]) : value;
    const next = { ...latest.current, [name]: resolved };
    latest.current = next;
    setValues(next);
    if (errors[name]) setErrors((current) => ({ ...current, [name]: validate(name, next) }));
  };

  // Props for a text input bound to a string field: value, onChange and the error message.
  const field = <K extends keyof T>(name: K) => ({
    value: values[name] as string,
    onChange: (value: string) => setValue(name, value as T[K]),
    error: fieldError(errors[name]),
  });

  // Checks one field now and shows its error. Returns true when it's valid.
  const check = (name: keyof T) => {
    const error = validate(name, latest.current);
    setErrors((current) => ({ ...current, [name]: error }));
    return !error;
  };

  // Returns a submit handler: validates every field, then runs `action`. A thrown error is kept in `requestError`.
  const submit = (action: (values: T) => Promise<void>) => async (event?: FormEvent) => {
    event?.preventDefault();
    if (submitting) return;
    const current = latest.current;
    const nextErrors = Object.fromEntries(
      (Object.keys(validators) as (keyof T)[]).map((name) => [name, validate(name, current)]),
    ) as FieldErrors<T>;
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    setRequestError(null);
    const result = await safeAsync(() => action(current));
    setSubmitting(false);
    if (!result.ok) setRequestError(result.error);
  };

  return { values, setValue, field, errors, check, submitting, requestError, submit };
};
