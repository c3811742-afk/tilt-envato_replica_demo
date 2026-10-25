import { Card, FileInput, Icon, Stack, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { FileInfo } from '@/shared/types';
import { formatFileSize } from '@/shared/utils';

interface UploadCardProps {
  label?: string; // left out when the field's label is shown above the card, like a text field's
  hint?: string;
  accept?: string;
  value: FileInfo | null;
  onChange: (file: FileInfo) => void;
  error?: string;
}

// A file to attach to the application: what it is, the chosen file, and a button to choose or replace it.
// Cards in the same row stretch to the same height; the file and its button stay at the bottom.
export const UploadCard = ({ label, hint, accept, value, onChange, error }: UploadCardProps) => {
  const { text, locale } = useLocale();
  const t = text.creatorOnboarding.files;

  const fileLine = (
    <Stack direction="row" align="center" gap={vars.spacing[2]}>
      <Icon name={value ? 'check' : 'upload'} size={vars.sizes.icon.sm} color={value ? vars.colors.primary : vars.colors.textMuted} />
      <Text variant="bodySm" color={value ? vars.colors.text : vars.colors.textMuted} maxLines={1}>
        {value ? `${value.name} · ${formatFileSize(value.size, locale)}` : t.none}
      </Text>
    </Stack>
  );
  const button = (
    <FileInput
      label={value ? t.replace : t.choose}
      accept={accept}
      variant="outline"
      error={error}
      onSelect={(file) => onChange({ name: file.name, size: file.size, type: file.type })}
    />
  );

  return (
    <Card borderColor={error ? vars.colors.danger : vars.colors.border}>
      {label ? (
        <>
          <Stack gap={vars.spacing[1]} grow>
            <Text as="span" variant="title">
              {label}
            </Text>
            {hint && (
              <Text variant="bodySm" color={vars.colors.textMuted}>
                {hint}
              </Text>
            )}
          </Stack>
          {fileLine}
          {button}
        </>
      ) : (
        // No title inside: the file and button sit in the middle of the box, like a drop area.
        <Stack grow justify="center" align="center" gap={vars.spacing[3]}>
          <Icon name="upload" size={vars.sizes.icon.lg} color={vars.colors.textMuted} />
          {fileLine}
          {button}
        </Stack>
      )}
    </Card>
  );
};
