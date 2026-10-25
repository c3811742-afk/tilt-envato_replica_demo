import { useState } from 'react';
import { Card, FieldMessage, FileInput, IconNote, Select, Stack, TextLink } from '@/shared/components';
import { creatorElementPath, routes, studioLimits } from '@/shared/constants';
import { useAction, useLocale } from '@/shared/hooks';
import { localeCodes, vars, type Locale } from '@/shared/theme';
import { fillText, formatFileSize, formatNumber, studioApi } from '@/shared/utils';
import { CreatorArea } from '@/features/creator/components';


// "Upload elements": one file or several at once. Each file becomes a draft, with its category guessed from the file,
// written in the language the creator chooses.
export const CreatorUploadPage = () => {
  const { text, locale } = useLocale();
  const [language, setLanguage] = useState<Locale>(locale);
  const { run, busy, error } = useAction();
  const [created, setCreated] = useState<{ id: string; name: string }[]>([]);

  const upload = async (files: File[]) => {
    const result = await run(() => studioApi.uploadDrafts(files, language));
    if (result.ok) setCreated(result.data.map((id, index) => ({ id, name: files[index]?.name ?? '' })));
  };

  return (
    <CreatorArea section="upload" title={text.studio.uploadTitle} subtitle={text.studio.uploadSubtitle}>
      <Card gap={vars.spacing[4]}>
        <Select
          label={text.studio.writeIn}
          value={language}
          onChange={(value) => setLanguage(value as Locale)}
          options={localeCodes.map((option) => ({ value: option, label: text.languageNames[option] }))}
        />
        <FileInput
          label={text.studio.chooseFiles}
          multiple
          variant="primary"
          busy={busy ? text.studio.uploading : undefined}
          hint={fillText(text.studio.uploadHint, { size: formatFileSize(studioLimits.fileMaxBytes, locale) })}
          onSelectFiles={(files) => void upload(files)}
        />
        <FieldMessage tone="error" message={error} />
      </Card>
      {created.length > 0 && (
        <Stack gap={vars.spacing[3]}>
          <IconNote icon="check" text={fillText(text.studio.uploaded, { count: formatNumber(created.length, locale) })} />
          <Stack as="ul" gap={vars.spacing[2]}>
            {created.map((draft) => (
              <li key={draft.id}>
                <TextLink to={creatorElementPath(draft.id)}>
                  <bdi>{draft.name}</bdi>
                </TextLink>
              </li>
            ))}
          </Stack>
          <TextLink to={routes.creatorElements}>{text.studio.backToElements}</TextLink>
        </Stack>
      )}
    </CreatorArea>
  );
};
