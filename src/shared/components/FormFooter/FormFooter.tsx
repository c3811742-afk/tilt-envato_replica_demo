import { useLocale, useMessages } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Button } from '../Button';
import { FieldMessage } from '../FieldMessage';
import { Stack } from '../Stack';
import { formFooterDefaults } from './FormFooter.defaults';
import type { FormFooterProps } from './FormFooter.types';

// The end of a form: why the last request failed (if it did), then the full-width submit button.
export const FormFooter = (props: FormFooterProps) => {
  const { label, submitting, requestError, variant } = withDefaults(formFooterDefaults, props);
  const { text } = useLocale();
  const messages = useMessages();

  return (
    <Stack gap={vars.spacing[3]}>
      <FieldMessage tone="error" message={requestError ? messages.requestError(requestError) : undefined} />
      <Button type="submit" size="lg" variant={variant} fullWidth disabled={submitting}>
        {submitting ? text.common.processing : (label ?? text.common.continue)}
      </Button>
    </Stack>
  );
};
