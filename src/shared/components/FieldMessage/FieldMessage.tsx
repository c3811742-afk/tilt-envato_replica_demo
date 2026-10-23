import { withDefaults } from '@/shared/utils';
import { Text } from '../Text';
import { fieldMessageColors, fieldMessageDefaults } from './FieldMessage.defaults';
import type { FieldMessageProps } from './FieldMessage.types';

// The line under a field or a form: a hint, or an error that says what went wrong.
export const FieldMessage = (props: FieldMessageProps) => {
  const { message, tone, id } = withDefaults(fieldMessageDefaults, props);
  if (!message) return null;

  return (
    <span id={id} role={tone === 'error' ? 'alert' : undefined}>
      <Text as="span" variant="bodySm" color={fieldMessageColors[tone]}>
        {message}
      </Text>
    </span>
  );
};
