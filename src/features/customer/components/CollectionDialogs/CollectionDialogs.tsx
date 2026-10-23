import { useState, type FormEvent } from 'react';
import { Button, Checkbox, FieldMessage, FileInput, Icon, Modal, Select, Stack, Text, TextField } from '@/shared/components';
import { collectionMaxDepth, collectionNameMaxLength, importFileTypes, sharedCollectionPath } from '@/shared/constants';
import { useCopy, useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { UserCollection } from '@/shared/types';
import { appUrl, collectionTree, collectionWithDescendants, fillText, formatNumber, libraryApi, safeAsync } from '@/shared/utils';

// Runs a collection request, keeps the account in sync and explains a failure.
const useCollectionRequest = () => {
  const { setAccount } = useSession();
  const { requestError } = useMessages();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const run = async <T,>(request: () => Promise<T>, account: (data: T) => Parameters<typeof setAccount>[0]) => {
    setBusy(true);
    const result = await safeAsync(request);
    setBusy(false);
    setError(result.ok ? undefined : requestError(result.error));
    if (!result.ok) return null;
    setAccount(account(result.data));
    return result.data;
  };
  return { busy, error, setError, run };
};

const DialogButtons = ({ busy, label, onClose, danger = false }: { busy: boolean; label: string; onClose: () => void; danger?: boolean }) => {
  const { text } = useLocale();
  return (
    <Stack direction="row" wrap justify="flex-end" gap={vars.spacing[3]}>
      <Button variant="outline" onClick={onClose}>
        {text.common.cancel}
      </Button>
      <Button type="submit" variant={danger ? 'danger' : 'primary'} disabled={busy}>
        {busy ? text.common.processing : label}
      </Button>
    </Stack>
  );
};

// "New collection" (at the top level or inside another one) and "Rename".
export const CollectionNameDialog = ({
  collection,
  parentId = null,
  onClose,
  onCreated,
}: {
  collection?: UserCollection; // rename this one; otherwise a new collection is created
  parentId?: string | null;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) => {
  const { text } = useLocale();
  const { busy, error, setError, run } = useCollectionRequest();
  const [name, setName] = useState(collection?.name ?? '');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(text.myCollections.nameRequired);
      return;
    }
    if (collection) {
      if (await run(() => libraryApi.renameCollection(collection.id, name), (account) => account)) onClose();
      return;
    }
    const created = await run(() => libraryApi.createCollection({ name, parentId }), (data) => data.account);
    if (created) {
      onCreated?.(created.id);
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={collection ? text.myCollections.rename : parentId ? text.myCollections.newInside : text.myCollections.new}>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        <TextField label={text.myCollections.name} value={name} onChange={setName} maxLength={collectionNameMaxLength} error={error} autoFocus />
        <DialogButtons busy={busy} label={collection ? text.common.saveChanges : text.myCollections.create} onClose={onClose} />
      </Stack>
    </Modal>
  );
};

// "Move": into another collection (not into itself or one inside it, and not deeper than allowed) or to the top level.
export const MoveCollectionDialog = ({ collection, collections, onClose }: { collection: UserCollection; collections: UserCollection[]; onClose: () => void }) => {
  const { text } = useLocale();
  const { busy, error, run } = useCollectionRequest();
  const blocked = new Set(collectionWithDescendants(collections, collection.id));
  const targets = collectionTree(collections).filter(({ collection: target, depth }) => !blocked.has(target.id) && depth + 1 < collectionMaxDepth);
  const topLevel = '';
  const [parentId, setParentId] = useState(collection.parentId ?? topLevel);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await run(() => libraryApi.moveCollection(collection.id, parentId || null), (account) => account)) onClose();
  };

  return (
    <Modal open onClose={onClose} title={text.myCollections.moveTitle}>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        <Select
          label={text.myCollections.moveTitle}
          value={parentId}
          onChange={setParentId}
          options={[
            { value: topLevel, label: text.myCollections.topLevel },
            // Nested collections are indented with spaces in the list.
            ...targets.map(({ collection: target, depth }) => ({ value: target.id, label: `${'  '.repeat(depth)}${target.name}` })),
          ]}
        />
        <FieldMessage tone="error" message={error} />
        <DialogButtons busy={busy} label={text.myCollections.move} onClose={onClose} />
      </Stack>
    </Modal>
  );
};

// "Share": turns the share link on or off, and copies it.
export const ShareCollectionDialog = ({ collection, onClose }: { collection: UserCollection; onClose: () => void }) => {
  const { text } = useLocale();
  const { busy, error, run } = useCollectionRequest();
  const { status, copy } = useCopy();
  const link = collection.shareId ? appUrl(sharedCollectionPath(collection.shareId)) : null;

  return (
    <Modal open onClose={onClose} title={text.myCollections.shareTitle}>
      <Checkbox
        label={text.myCollections.shareOn}
        checked={Boolean(collection.shareId)}
        disabled={busy}
        onChange={(shared) => void run(() => libraryApi.setShared(collection.id, shared), (account) => account)}
      />
      {link ? (
        <Stack gap={vars.spacing[2]}>
          <TextField label={text.common.copyLink} value={link} direction="ltr" onChange={() => undefined} />
          <div>
            <Button variant="secondary" onClick={() => copy(link)}>
              <Icon name={status === 'copied' ? 'check' : 'link'} size={vars.sizes.icon.sm} />
              {status === 'copied' ? text.common.linkCopied : text.common.copyLink}
            </Button>
          </div>
          {status === 'failed' && <FieldMessage tone="error" message={text.common.copyFailed} />}
        </Stack>
      ) : (
        <Text color={vars.colors.textMuted}>{text.myCollections.shareOff}</Text>
      )}
      <FieldMessage tone="error" message={error} />
    </Modal>
  );
};

// "Delete": the collections with everything inside them.
export const DeleteCollectionsDialog = ({ ids, onClose, onDeleted }: { ids: string[]; onClose: () => void; onDeleted?: () => void }) => {
  const { text, locale } = useLocale();
  const { busy, error, run } = useCollectionRequest();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await run(() => libraryApi.deleteCollections(ids), (account) => account)) {
      onDeleted?.();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={text.myCollections.deleteTitle}>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        <Text>{fillText(text.myCollections.deleteText, { count: formatNumber(ids.length, locale) })}</Text>
        <FieldMessage tone="error" message={error} />
        <DialogButtons busy={busy} label={text.myCollections.delete} onClose={onClose} danger />
      </Stack>
    </Modal>
  );
};

// "Migrate previous work": item links or ids, pasted or from a file, go into a new collection.
export const ImportDialog = ({ onClose, onImported }: { onClose: () => void; onImported: (id: string) => void }) => {
  const { text, locale } = useLocale();
  const { busy, error, setError, run } = useCollectionRequest();
  const [lines, setLines] = useState('');
  const [reading, setReading] = useState(false);
  const [result, setResult] = useState<{ id: string; imported: number; skipped: number } | null>(null);

  const readFile = async (file: File) => {
    setReading(true);
    const read = await safeAsync(() => file.text());
    setReading(false);
    if (!read.ok) {
      console.error(read.error);
      setError(text.states.error.message);
      return;
    }
    setLines((current) => [current, read.data].filter(Boolean).join('\n'));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const wanted = lines.split(/\r?\n/).filter((line) => line.trim());
    if (!wanted.length) {
      setError(text.validation.required);
      return;
    }
    const imported = await run(() => libraryApi.importItems({ lines: wanted, name: text.myCollections.importName }), (data) => data.account);
    if (imported) setResult(imported);
  };

  if (result) {
    return (
      <Modal
        open
        onClose={onClose}
        title={text.myCollections.importTitle}
        actions={<Button onClick={() => onImported(result.id)}>{text.common.continue}</Button>}
      >
        <Text>{fillText(text.myCollections.importDone, { count: formatNumber(result.imported, locale), name: text.myCollections.importName })}</Text>
        {result.skipped > 0 && (
          <Text color={vars.colors.textMuted}>{fillText(text.myCollections.importSkipped, { count: formatNumber(result.skipped, locale) })}</Text>
        )}
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title={text.myCollections.importTitle}>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        <Text color={vars.colors.textMuted}>{text.myCollections.importText}</Text>
        <TextField label={text.myCollections.importLines} value={lines} onChange={setLines} rows={6} direction="ltr" />
        <FileInput
          label={text.myCollections.importFile}
          accept={importFileTypes}
          icon="upload"
          variant="outline"
          busy={reading ? text.common.processing : undefined}
          onSelect={(file) => void readFile(file)}
        />
        <FieldMessage tone="error" message={error} />
        <DialogButtons busy={busy} label={text.myCollections.import} onClose={onClose} />
      </Stack>
    </Modal>
  );
};
