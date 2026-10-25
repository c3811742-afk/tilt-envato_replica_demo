import { useId, type CSSProperties } from 'react';
import { withDefaults } from '@/shared/utils';
import { FieldMessage } from '../FieldMessage';
import { Text } from '../Text';
import { fieldGroupDefaults } from './FieldGroup.defaults';
import type { FieldGroupProps } from './FieldGroup.types';
import styles from './FieldGroup.module.css';

// Several controls under one label (a list of checkboxes, an English and Arabic pair): a <fieldset> whose
// legend looks like a TextField's label, with the same hint and error message under it.
export const FieldGroup = (props: FieldGroupProps) => {
  const { label, children, hint, error, gap } = withDefaults(fieldGroupDefaults, props);
  const messageId = useId();
  const message = error ?? hint;
  const style = { '--field-group-gap': gap } as CSSProperties;

  return (
    <fieldset className={styles.group} style={style} aria-describedby={message ? messageId : undefined}>
      <legend className={styles.legend}>
        <Text as="span" variant="title">
          {label}
        </Text>
      </legend>
      {children}
      <FieldMessage id={messageId} message={message} tone={error ? 'error' : 'hint'} />
    </fieldset>
  );
};
