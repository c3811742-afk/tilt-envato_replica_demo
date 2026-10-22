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
  const { label, accept, onSelect, hint, error, busy, icon, variant, disabled } = withDefaults(fileInputDefaults, props);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageId = useId();

  return (
    <Stack gap={vars.spacing[1]} align="flex-start">
      <Button variant={variant} disabled={disabled || Boolean(busy)} onClick={() => inputRef.current?.click()}>
        <Icon name={icon} size={vars.sizes.icon.sm} />
        {busy ?? label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        aria-describedby={messageId}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = ''; // picking the same file again still counts as a new choice
          if (file) onSelect?.(file);
        }}
      />
      <FieldMessage id={messageId} tone={error ? 'error' : 'hint'} message={error ?? hint} />
    </Stack>
  );
};
