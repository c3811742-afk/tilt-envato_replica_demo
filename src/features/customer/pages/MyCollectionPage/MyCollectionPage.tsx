import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AsyncContent,
  Button,
  ChipGroup,
  EmptyState,
  FieldMessage,
  FileInput,
  Grid,
  Icon,
  ItemGrid,
  Page,
  Section,
  Select,
  Stack,
  Text,
  TextField,
  TextLink,
} from '@/shared/components';
import {
  collectionDownloadStates,
  collectionMaxDepth,
  collectionSources,
  myCollectionPath,
  myCollectionsPath,
  routes,
  uploadKinds,
  uploadMaxBytes,
  type CollectionDownloadState,
  type CollectionSource,
} from '@/shared/constants';
import { useAsync, useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item, UserCollection } from '@/shared/types';
import { api, fillText, formatFileSize, libraryApi, matchesText, safeAsync } from '@/shared/utils';
import {
  CollectionNameDialog,
  DeleteCollectionsDialog,
  MoveCollectionDialog,
  ShareCollectionDialog,
  UploadTile,
  UserCollectionCard,
} from '@/features/customer/components';
import { DownloadAllDialog } from './DownloadAllDialog';

type Dialog = 'newInside' | 'rename' | 'move' | 'share' | 'delete' | 'downloadAll' | null;
const allTypes = '';

// One of the user's collections: the collections inside it, its items and the user's own files,
// with search and filters (type, source, downloaded), uploads, and "Download all".
export const MyCollectionPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const { id } = useParams();
  // The collection is one of the user's own, or one of their team's shared ones; its neighbours come from the same place.
  const own = session.status === 'signedIn' ? session.user.collections : [];
  const shared = session.status === 'signedIn' ? (session.team?.collections ?? []) : [];
  const collections = own.some((candidate) => candidate.id === id) ? own : shared;
  const collection = collections.find((candidate) => candidate.id === id);

  if (!collection) {
    return (
      <Page>
        <EmptyState
          title={text.myCollections.notFoundTitle}
          message={text.myCollections.notFoundMessage}
          action={<Button to={routes.myCollections}>{text.myCollections.back}</Button>}
        />
      </Page>
    );
  }
  return <CollectionView key={collection.id} collection={collection} collections={collections} scope={collections === own ? 'own' : 'team'} />;
};

const CollectionView = ({ collection, collections, scope }: { collection: UserCollection; collections: UserCollection[]; scope: 'own' | 'team' }) => {
  const { text, locale } = useLocale();
  const { session, setAccount } = useSession();
  const { requestError } = useMessages();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState(allTypes);
  const [sources, setSources] = useState<CollectionSource[]>([]);
  const [downloadStates, setDownloadStates] = useState<CollectionDownloadState[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const items = useAsync(() => api.getItemsByIds(collection.itemIds), [collection.itemIds.join()], () => false);
  const loadedItems = items.status === 'success' ? items.data : []; // for the type filter's options
  const parent = collections.find((candidate) => candidate.id === collection.parentId);
  const children = collections.filter((candidate) => candidate.parentId === collection.id);
  const depth = (function measure(current: UserCollection | undefined): number {
    return current ? 1 + measure(collections.find((candidate) => candidate.id === current.parentId)) : 0;
  })(collection);
  const downloadedIds = new Set(session.status === 'signedIn' ? session.user.downloads.map((download) => download.itemId) : []);

  const run = async (request: () => Promise<Parameters<typeof setAccount>[0]>) => {
    const result = await safeAsync(request);
    setError(result.ok ? undefined : requestError(result.error));
    if (result.ok) setAccount(result.data);
  };

  const upload = async (file: File) => {
    setUploading(true);
    await run(() => libraryApi.uploadToCollection(collection.id, file));
    setUploading(false);
  };

  // An item matches when it passes every filter that is set.
  const showItem = (item: Item) =>
    (!type || type === item.categoryId) &&
    (!sources.length || sources.includes('library')) &&
    (!downloadStates.length || downloadStates.includes(downloadedIds.has(item.id) ? 'downloaded' : 'notDownloaded')) &&
    matchesText(query, item.title[locale], item.creator.name, ...item.tags);
  // Uploads are never "downloaded": they are the user's own files.
  const shownUploads = collection.uploads.filter(
    (file) =>
      (!type || type === file.kind) &&
      (!sources.length || sources.includes('upload')) &&
      (!downloadStates.length || downloadStates.includes('notDownloaded')) &&
      matchesText(query, file.name),
  );

  return (
    <Page title={collection.name} gap={vars.spacing[6]}>
      <TextLink to={parent ? myCollectionPath(parent.id) : myCollectionsPath(scope)} variant="bodySm">
        {parent ? parent.name : scope === 'team' ? text.myCollections.scopes.team : text.myCollections.back}
      </TextLink>

      <Stack direction="row" wrap gap={vars.spacing[2]}>
        <Button size="sm" onClick={() => setDialog('downloadAll')} disabled={collection.itemIds.length === 0}>
          <Icon name="download" size={vars.sizes.icon.sm} />
          {text.myCollections.downloadAll}
        </Button>
        <Button variant="outline" size="sm" onClick={() => void run(() => libraryApi.setPinned(collection.id, !collection.pinned))} pressed={collection.pinned}>
          <Icon name="pin" size={vars.sizes.icon.sm} />
          {collection.pinned ? text.myCollections.unpin : text.myCollections.pin}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDialog('share')}>
          <Icon name="share" size={vars.sizes.icon.sm} />
          {text.myCollections.share}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDialog('rename')}>
          <Icon name="pencil" size={vars.sizes.icon.sm} />
          {text.myCollections.rename}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDialog('move')}>
          <Icon name="folder" size={vars.sizes.icon.sm} />
          {text.myCollections.move}
        </Button>
        <Button variant="danger" size="sm" onClick={() => setDialog('delete')}>
          <Icon name="trash" size={vars.sizes.icon.sm} />
          {text.myCollections.delete}
        </Button>
      </Stack>
      <FieldMessage tone="error" message={error} />

      <Section title={text.myCollections.inside} variant="h3">
        {children.length > 0 && (
          <Grid minColumnWidth={vars.sizes.itemCard.minWidth.medium} gap={vars.spacing[4]} ariaLabel={text.myCollections.inside}>
            {children.map((child) => (
              <UserCollectionCard
                key={child.id}
                collection={child}
                to={myCollectionPath(child.id)}
                childCount={collections.filter((other) => other.parentId === child.id).length}
              />
            ))}
          </Grid>
        )}
        {depth < collectionMaxDepth && (
          <div>
            <Button variant="outline" size="sm" onClick={() => setDialog('newInside')}>
              <Icon name="plus" size={vars.sizes.icon.sm} />
              {text.myCollections.newInside}
            </Button>
          </div>
        )}
      </Section>

      <Section title={text.myCollections.contents} variant="h3" gap={vars.spacing[4]}>
        <FileInput
          label={text.myCollections.upload}
          accept={uploadKinds.map((kind) => `${kind}/*`).join(',')}
          icon="upload"
          variant="secondary"
          hint={fillText(text.myCollections.uploadHint, { size: formatFileSize(uploadMaxBytes, locale) })}
          busy={uploading ? text.myCollections.uploading : undefined}
          onSelect={(file) => void upload(file)}
        />

        <Stack direction="row" wrap align="flex-end" gap={vars.spacing[4]}>
          <Stack grow>
            <TextField label={text.myCollections.searchInside} value={query} onChange={setQuery} />
          </Stack>
          <Select
            label={text.myCollections.filterType}
            value={type}
            onChange={setType}
            options={[
              { value: allTypes, label: text.myCollections.allTypes },
              ...[...new Set(loadedItems.map((item) => item.categoryId))].map((categoryId) => ({ value: categoryId, label: text.categories[categoryId].name })),
              ...[...new Set(collection.uploads.map((file) => file.kind))].map((kind) => ({ value: kind, label: text.myCollections.uploadKinds[kind] })),
            ]}
          />
        </Stack>
        <Stack direction="row" wrap gap={vars.spacing[5]}>
          <ChipGroup
            label={text.myCollections.filterSource}
            multiple
            value={sources}
            onChange={setSources}
            options={collectionSources.map((source) => ({ value: source, label: text.myCollections.sources[source] }))}
          />
          <ChipGroup
            label={text.myCollections.filterDownloaded}
            multiple
            value={downloadStates}
            onChange={setDownloadStates}
            options={collectionDownloadStates.map((state) => ({ value: state, label: text.myCollections.downloadStates[state] }))}
          />
        </Stack>

        <AsyncContent state={items}>
          {(data) => {
            const shownItems = data.filter(showItem);
            if (data.length === 0 && collection.uploads.length === 0) {
              return <EmptyState title={text.myCollections.emptyTitle} message={text.myCollections.emptyMessage} action={<Button to={routes.search}>{text.home.cta}</Button>} />;
            }
            if (shownItems.length === 0 && shownUploads.length === 0) {
              return <Text color={vars.colors.textMuted}>{text.search.noResultsInCategory}</Text>;
            }
            return (
              <Stack gap={vars.spacing[5]}>
                {shownItems.length > 0 && (
                  <ItemGrid
                    items={shownItems}
                    label={text.myCollections.contents}
                    actionsFor={(item) => (
                      <Button
                        variant="outline"
                        size="sm"
                        ariaLabel={`${text.myCollections.removeFromCollection} ${item.title[locale]}`}
                        onClick={() => void run(() => libraryApi.removeFromCollection(collection.id, { itemIds: [item.id] }))}
                      >
                        <Icon name="trash" size={vars.sizes.icon.sm} />
                      </Button>
                    )}
                  />
                )}
                {shownUploads.length > 0 && (
                  <Grid minColumnWidth={vars.sizes.itemCard.minWidth.medium} gap={vars.spacing[4]} ariaLabel={text.myCollections.sources.upload}>
                    {shownUploads.map((file) => (
                      <UploadTile key={file.id} upload={file} onRemove={() => void run(() => libraryApi.removeFromCollection(collection.id, { uploadIds: [file.id] }))} />
                    ))}
                  </Grid>
                )}
              </Stack>
            );
          }}
        </AsyncContent>
      </Section>

      {dialog === 'newInside' && <CollectionNameDialog parentId={collection.id} onClose={() => setDialog(null)} />}
      {dialog === 'rename' && <CollectionNameDialog collection={collection} onClose={() => setDialog(null)} />}
      {dialog === 'move' && <MoveCollectionDialog collection={collection} collections={collections} onClose={() => setDialog(null)} />}
      {dialog === 'share' && <ShareCollectionDialog collection={collection} onClose={() => setDialog(null)} />}
      {dialog === 'delete' && (
        <DeleteCollectionsDialog
          ids={[collection.id]}
          onClose={() => setDialog(null)}
          onDeleted={() => navigate(parent ? myCollectionPath(parent.id) : myCollectionsPath(scope))}
        />
      )}
      {dialog === 'downloadAll' && <DownloadAllDialog collection={collection} onClose={() => setDialog(null)} />}
    </Page>
  );
};
