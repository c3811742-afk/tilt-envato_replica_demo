import { useState } from 'react';
import { Button, Card, FieldMessage, FileInput, IconNote, Select, Stack, Text } from '@/shared/components';
import { trackVersionKinds, type TrackVersionKind } from '@/shared/constants';
import { useAction, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { StudioElement, StudioFile } from '@/shared/types';
import { fillText, formatFileSize, formatNumber, studioApi } from '@/shared/utils';

interface ElementFilesProps {
  element: StudioElement;
  editable: boolean;
  onChange: (element: StudioElement) => void;
}

const FileList = ({ files, editable, onRemove }: { files: StudioFile[]; editable: boolean; onRemove: (file: StudioFile) => void }) => {
  const { text, locale } = useLocale();
  if (!files.length) return null;
  return (
    <Stack as="ul" gap={vars.spacing[2]}>
      {files.map((file) => (
        <Stack key={file.id} as="li" direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
          <Text variant="bodySm">
            <bdi>{file.name}</bdi> · {formatFileSize(file.size, locale)}
          </Text>
          {editable && (
            <Button variant="outline" size="sm" onClick={() => onRemove(file)}>
              {text.studio.removeFile}
            </Button>
          )}
        </Stack>
      ))}
    </Stack>
  );
};

// The element's files: what customers download, the previews, and for music the alternate versions and loops.
// A live element gets a new version of its files instead (everyone who licensed it is told).
export const ElementFiles = ({ element, editable, onChange }: ElementFilesProps) => {
  const { text, locale } = useLocale();
  const { run, busy, error } = useAction();
  const [versionKind, setVersionKind] = useState<TrackVersionKind>(trackVersionKinds[0]);
  const live = element.status === 'live';

  const apply = async (request: () => Promise<StudioElement>) => {
    const result = await run(request);
    if (result.ok) onChange(result.data);
  };
  const remove = (file: StudioFile) => void apply(() => studioApi.removeFile(element.id, file.id));

  return (
    <Card gap={vars.spacing[5]}>
      <Text as="h2" variant="h4">
        {text.studio.filesTitle}
      </Text>

      <Stack gap={vars.spacing[2]}>
        <Text variant="title">
          {text.studio.mainFiles} {live && `(${fillText(text.studio.fileVersion, { version: formatNumber(element.fileVersion, locale) })})`}
        </Text>
        <FileList files={element.files} editable={editable && !live} onRemove={remove} />
        {live ? (
          <Stack gap={vars.spacing[2]} align="flex-start">
            <IconNote text={text.studio.replaceNote} />
            <FileInput label={text.studio.replaceFiles} multiple busy={busy ? text.studio.uploading : undefined} onSelectFiles={(files) => void apply(() => studioApi.replaceFiles(element.id, files))} />
          </Stack>
        ) : (
          editable && <FileInput label={text.studio.addFiles} multiple busy={busy ? text.studio.uploading : undefined} onSelectFiles={(files) => void apply(() => studioApi.addFiles(element.id, 'files', files))} />
        )}
      </Stack>

      <Stack gap={vars.spacing[2]}>
        <Text variant="title">{text.studio.previewFiles}</Text>
        <FileList files={element.previews} editable={editable} onRemove={remove} />
        {editable && (
          <FileInput
            label={text.studio.addPreviews}
            accept="image/*,video/*,audio/*"
            icon="image"
            multiple
            busy={busy ? text.studio.uploading : undefined}
            onSelectFiles={(files) => void apply(() => studioApi.addFiles(element.id, 'previews', files))}
          />
        )}
      </Stack>

      {element.categoryId === 'music' && (
        <Stack gap={vars.spacing[2]}>
          <Text variant="title">{text.studio.versionsTitle}</Text>
          <FileList files={element.versions.map((version) => ({ ...version.file, name: `${text.item.versionKinds[version.kind]}: ${version.file.name}` }))} editable={editable} onRemove={remove} />
          {editable && (
            <Stack direction="row" wrap align="flex-end" gap={vars.spacing[3]}>
              <Select
                label={text.studio.versionKind}
                value={versionKind}
                onChange={(value) => setVersionKind(value as TrackVersionKind)}
                options={trackVersionKinds.map((kind) => ({ value: kind, label: text.item.versionKinds[kind] }))}
              />
              <FileInput
                label={text.studio.addVersion}
                accept="audio/*"
                icon="music"
                busy={busy ? text.studio.uploading : undefined}
                onSelect={(file) => void apply(() => studioApi.addVersion(element.id, versionKind, file))}
              />
            </Stack>
          )}
        </Stack>
      )}
      <FieldMessage tone="error" message={error} />
    </Card>
  );
};
