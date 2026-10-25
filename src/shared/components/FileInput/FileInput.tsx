import { useId, useRef } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Button } from '../Button';
import { FieldMessage } from '../FieldMessage';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { fileInputDefaults } from './FileInput.defaults';
import type { FileInputProps } from './FileInput.types';

// A button that opens the device's file picker (an image to search with, an audio file to match).
export const FileInput = (props: FileInputProps) => {
  const { label, accept, onSelect, multiple, onSelectFiles, hint, error, busy, icon, variant, size, disabled, iconOnly } = withDefaults(fileInputDefaults, props);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageId = useId();

  return (
    <Stack gap={vars.spacing[1]} align="flex-start">
      <Button
        variant={variant}
        size={size}
        iconOnly={iconOnly}
        tooltip={iconOnly ? (busy ?? label) : undefined}
        disabled={disabled || Boolean(busy)}
        onClick={() => inputRef.current?.click()}
      >
        <Icon name={icon} size={vars.sizes.icon.sm} />
        {!iconOnly && (busy ?? label)}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        aria-describedby={messageId}
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = ''; // picking the same file again still counts as a new choice
          if (files[0]) onSelect?.(files[0]);
          if (files.length) onSelectFiles?.(files);
        }}
      />
      <FieldMessage id={messageId} tone={error ? 'error' : 'hint'} message={error ?? (iconOnly ? undefined : hint)} />
    </Stack>
  );
};
