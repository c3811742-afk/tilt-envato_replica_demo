import { useState } from 'react';
import { Badge, Button, Card, FieldMessage, Grid, Icon, IconNote, Modal, Select, Stack, Text } from '@/shared/components';
import { aiShortcuts, aiToolPath, type AiOperation } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Generation, GenerationOutput, UserCollection } from '@/shared/types';
import {
  buildLicenseCertificate,
  collectionTree,
  downloadFile,
  downloadTextFile,
  fillText,
  formatDate,
  formatNumber,
  libraryApi,
  safeAsync,
  speak,
  stopSpeaking,
  toFileName,
  type GenerationStatus,
} from '@/shared/utils';
import { operationName, outputBlob, outputFileName, outputRef, useOutputUrl } from './outputs';
import styles from './AiStudio.module.css';

const dateTimeFormat: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };
const statusBadges = { queued: 'neutral', running: 'highlight', done: 'free' } as const;

// Tools that can take an image result as their input, offered under "Use in".
const imageNextSteps: AiOperation[] = ['edit', 'backgroundRemove', 'erase', 'upscale', 'mockup', 'video'];

interface AiResultProps {
  generation: Generation;
  status: GenerationStatus;
}

// One generation: what was asked, its status, and when it's ready the results with Download, Save to collection,
// its license, and (for images) the quick edits and other tools.
export const AiResult = ({ generation, status }: AiResultProps) => {
  const { text, locale } = useLocale();
  const { requestError } = useMessages();
  const [error, setError] = useState<string>();
  const name = operationName(text, generation.tool);

  const downloadLicense = async () => {
    const result = await safeAsync(() => libraryApi.checkLicense(generation.licenseCode ?? ''));
    if (!result.ok || !result.data) {
      setError(requestError(result.ok ? null : result.error));
      return;
    }
    setError(undefined);
    downloadTextFile(`${toFileName(name)}-license.txt`, buildLicenseCertificate(result.data, text, locale));
  };

  return (
    <Card as="li" gap={vars.spacing[3]}>
      <Stack direction="row" wrap align="flex-start" justify="space-between" gap={vars.spacing[2]}>
        <Stack gap={vars.spacing[1]}>
          <Text variant="title">{name}</Text>
          {(generation.prompt || generation.sourceName) && (
            <Text variant="bodySm" autoDirection maxLines={2}>
              {generation.prompt || generation.sourceName}
            </Text>
          )}
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {[
              generation.model ? text.ai.models[generation.model] : null,
              fillText(text.ai.cost, { credits: formatNumber(generation.credits, locale) }),
              formatDate(generation.createdAt, locale, dateTimeFormat),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </Stack>
        <Badge variant={statusBadges[status]}>{text.ai.statuses[status]}</Badge>
      </Stack>

      {status === 'done' && (
        <>
          <Grid minColumnWidth={vars.sizes.itemCard.minWidth.medium} gap={vars.spacing[3]} ariaLabel={generation.prompt || name}>
            {generation.outputs.map((output, index) => (
              <OutputTile key={index} generation={generation} output={output} index={index} />
            ))}
          </Grid>
          {generation.licenseCode && (
            <div>
              <Button variant="outline" size="sm" onClick={() => void downloadLicense()}>
                <Icon name="license" size={vars.sizes.icon.sm} />
                {text.ai.license}
              </Button>
            </div>
          )}
          <FieldMessage tone="error" message={error} />
        </>
      )}
    </Card>
  );
};

const OutputTile = ({ generation, output, index }: { generation: Generation; output: GenerationOutput; index: number }) => {
  const { text, locale } = useLocale();
  const { requestError } = useMessages();
  const url = useOutputUrl(generation, index);
  const [saving, setSaving] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string>();
  const label = fillText(text.ai.imageLabel, { number: formatNumber(index + 1, locale), prompt: generation.prompt });

  const download = async () => {
    const result = await safeAsync(() => outputBlob(generation, index));
    setError(result.ok ? undefined : requestError(result.error));
    if (result.ok) downloadFile(outputFileName(generation, index, result.data), result.data);
  };

  return (
    <Stack as="li" gap={vars.spacing[2]}>
      {output.kind === 'image' && url && <img className={styles.media} src={url} alt={label} />}
      {output.kind === 'video' && url && <video className={styles.media} src={url} controls aria-label={label} />}
      {output.kind === 'audio' && url && <audio className={styles.audio} src={url} controls aria-label={label} />}
      {output.kind === 'speech' && (
        <Stack gap={vars.spacing[2]} align="flex-start">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (speaking) {
                stopSpeaking();
                setSpeaking(false);
                return;
              }
              setSpeaking(speak(generation.prompt, generation.language ?? 'ar', generation.voice ?? 'female', () => setSpeaking(false)));
            }}
          >
            <Icon name={speaking ? 'pause' : 'play'} size={vars.sizes.icon.sm} />
            {speaking ? text.ai.stop : text.ai.play}
          </Button>
          <IconNote text={text.ai.speechNote} />
        </Stack>
      )}

      {output.kind !== 'speech' && (
        <Stack direction="row" wrap gap={vars.spacing[2]}>
          <Button variant="outline" size="sm" onClick={() => void download()} ariaLabel={`${text.ai.download} ${label}`}>
            <Icon name="download" size={vars.sizes.icon.sm} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSaving(true)} ariaLabel={`${text.ai.saveToCollection} ${label}`}>
            <Icon name="folder" size={vars.sizes.icon.sm} />
          </Button>
        </Stack>
      )}
      {output.kind === 'image' && <NextSteps generation={generation} index={index} />}
      <FieldMessage tone="error" message={error} />
      {saving && <SaveDialog generation={generation} index={index} onClose={() => setSaving(false)} />}
    </Stack>
  );
};

// The quick edits and the tools an image result can go into.
const NextSteps = ({ generation, index }: { generation: Generation; index: number }) => {
  const { text } = useLocale();
  const ref = outputRef(generation, index);
  return (
    <Stack gap={vars.spacing[1]}>
      <Text as="span" variant="label" color={vars.colors.textMuted}>
        {text.ai.shortcutsTitle}
      </Text>
      <Stack direction="row" wrap gap={vars.spacing[1]}>
        {aiShortcuts.map((shortcut) => (
          <Button key={shortcut} variant="muted" size="sm" to={aiToolPath(shortcut, ref)}>
            {text.ai.shortcuts[shortcut]}
          </Button>
        ))}
      </Stack>
      <Text as="span" variant="label" color={vars.colors.textMuted}>
        {text.ai.useIn}
      </Text>
      <Stack direction="row" wrap gap={vars.spacing[1]}>
        {imageNextSteps.map((tool) => (
          <Button key={tool} variant="muted" size="sm" to={aiToolPath(tool, ref)}>
            {operationName(text, tool)}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
};

// "Save to collection": the result is added to one of the user's (or their team's) collections as an upload.
const SaveDialog = ({ generation, index, onClose }: { generation: Generation; index: number; onClose: () => void }) => {
  const { text } = useLocale();
  const { session, setAccount } = useSession();
  const { requestError } = useMessages();
  const own = session.status === 'signedIn' ? session.user.collections : [];
  const team = session.status === 'signedIn' ? (session.team?.collections ?? []) : [];
  const options = [...collectionTree(own), ...collectionTree(team)];
  const [collectionId, setCollectionId] = useState(options[0]?.collection.id ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [savedTo, setSavedTo] = useState<UserCollection | null>(null);

  const save = async () => {
    setBusy(true);
    const result = await safeAsync(async () => {
      const blob = await outputBlob(generation, index);
      return libraryApi.uploadToCollection(collectionId, new File([blob], outputFileName(generation, index, blob), { type: blob.type }));
    });
    setBusy(false);
    setError(result.ok ? undefined : requestError(result.error));
    if (!result.ok) return;
    setAccount(result.data);
    setSavedTo(options.find((option) => option.collection.id === collectionId)?.collection ?? null);
  };

  return (
    <Modal open onClose={onClose} title={text.ai.saveToCollection}>
      {options.length === 0 ? (
        <Text color={vars.colors.textMuted}>{text.myCollections.emptyMessage}</Text>
      ) : (
        <Select
          label={text.myCollections.saveToTitle}
          value={collectionId}
          onChange={setCollectionId}
          // Nested collections are indented with spaces in the list.
          options={options.map(({ collection, depth }) => ({ value: collection.id, label: `${'  '.repeat(depth)}${collection.name}` }))}
        />
      )}
      {savedTo && <IconNote icon="check" text={fillText(text.ai.savedTo, { name: savedTo.name })} />}
      <FieldMessage tone="error" message={error} />
      <Stack direction="row" wrap justify="flex-end" gap={vars.spacing[3]}>
        <Button variant="outline" onClick={onClose}>
          {savedTo ? text.common.done : text.common.cancel}
        </Button>
        {options.length > 0 && !savedTo && (
          <Button disabled={busy || !collectionId} onClick={() => void save()}>
            {busy ? text.common.processing : text.common.save}
          </Button>
        )}
      </Stack>
    </Modal>
  );
};
