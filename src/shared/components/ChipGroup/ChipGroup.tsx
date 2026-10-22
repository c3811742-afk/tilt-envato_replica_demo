import { useId } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Chip } from '../Chip';
import { FieldMessage } from '../FieldMessage';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { chipGroupDefaults } from './ChipGroup.defaults';
import type { ChipGroupProps, ChipOption } from './ChipGroup.types';

// A labelled set of chips to pick one option (role) or several (interests).
export const ChipGroup = <T extends string>(props: ChipGroupProps<T>) => {
  const resolved = withDefaults(chipGroupDefaults, props);
  const { label, onChange, multiple, hint, error } = resolved;
  const options = resolved.options as ChipOption<T>[];
  const value = resolved.value as T[];
  const labelId = useId();
  const message = error ?? hint;

  const toggle = (option: T) => {
    if (!multiple) onChange?.([option]);
    else onChange?.(value.includes(option) ? value.filter((selected) => selected !== option) : [...value, option]);
  };

  return (
    <Stack gap={vars.spacing[2]}>
      {label && (
        <Text id={labelId} variant="title">
          {label}
        </Text>
      )}
      <div role="group" aria-labelledby={label ? labelId : undefined}>
        <Stack direction="row" wrap gap={vars.spacing[2]}>
          {options.map((option) => (
            <Chip key={option.value} icon={option.icon} selected={value.includes(option.value)} onClick={() => toggle(option.value)}>
              {option.label}
            </Chip>
          ))}
        </Stack>
      </div>
      <FieldMessage message={message} tone={error ? 'error' : 'hint'} />
    </Stack>
  );
};
