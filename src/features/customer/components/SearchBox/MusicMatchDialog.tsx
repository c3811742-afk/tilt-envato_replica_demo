import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button, Divider, FileInput, Modal, Stack, Text, TextField } from '@/shared/components';
import { catalog, searchPath } from '@/shared/constants';
import { useLocale, type SoundSource } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { SoundProfile } from '@/shared/types';
import { analyzeAudioFile, fillText, formatFileSize, musicLinkService, safeAsync, sampleProfileFromLink, soundProfileToParam } from '@/shared/utils';

interface MusicMatchDialogProps {
  open: boolean;
  onClose: () => void;
}

const audioTypes = 'audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a';

// Find similar music: paste a YouTube or Spotify link, or upload an audio file. Results match its tempo and energy.
export const MusicMatchDialog = ({ open, onClose }: MusicMatchDialogProps) => {
  const { text, locale } = useLocale();
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [linkError, setLinkError] = useState<string>();
  const [fileError, setFileError] = useState<string>();
  const [analyzing, setAnalyzing] = useState(false);
  const maxSize = formatFileSize(catalog.uploadLimits.audioBytes, locale);

  // A new search of the music category.
  const searchWith = (soundsLike: SoundProfile, soundSource: SoundSource) => {
    onClose();
    navigate(searchPath({ category: 'music', soundsLike: soundProfileToParam(soundsLike), soundSource }));
  };

  const submitLink = (event: FormEvent) => {
    event.preventDefault();
    const service = musicLinkService(link);
    if (!service) return setLinkError(text.musicMatch.linkInvalid);
    setLinkError(undefined);
    searchWith(sampleProfileFromLink(link), service);
  };

  const upload = async (file: File) => {
    setFileError(undefined);
    if (file.size > catalog.uploadLimits.audioBytes) return setFileError(fillText(text.musicMatch.tooLarge, { size: maxSize }));
    setAnalyzing(true);
    const result = await safeAsync(() => analyzeAudioFile(file));
    setAnalyzing(false);
    if (!result.ok) return setFileError(text.musicMatch.fileInvalid);
    searchWith(result.data, 'file');
  };

  return (
    <Modal open={open} onClose={onClose} title={text.musicMatch.title}>
      <Stack as="form" gap={vars.spacing[3]} onSubmit={submitLink} noValidate>
        <TextField
          label={text.musicMatch.linkLabel}
          placeholder={text.musicMatch.linkPlaceholder}
          value={link}
          onChange={(value) => {
            setLink(value);
            if (linkError) setLinkError(undefined);
          }}
          error={linkError}
          direction="ltr"
        />
        <div>
          <Button type="submit">{text.musicMatch.findWithLink}</Button>
        </div>
      </Stack>
      <Divider />
      <Text variant="title">{text.musicMatch.or}</Text>
      <FileInput
        label={text.musicMatch.upload}
        accept={audioTypes}
        busy={analyzing ? text.musicMatch.analyzing : undefined}
        hint={fillText(text.musicMatch.uploadHint, { size: maxSize })}
        error={fileError}
        onSelect={upload}
      />
    </Modal>
  );
};
