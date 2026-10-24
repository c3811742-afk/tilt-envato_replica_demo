import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AsyncContent, Button, EmptyState, FieldMessage, FileInput, FilterBar, Grid, Icon, ItemCard, Page, SearchBar, Select, Stack, Text } from '@/shared/components';
import {
  collectionDownloadStates,
  collectionMaxDepth,
  collectionSources,
  myCollectionPath,
  myCollectionsPath,
  routes,
  uploadKinds,
} from '@/shared/constants';
import { useAccountAction, useAsync, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item, UserCollection } from '@/shared/types';
import { api, libraryApi, matchesText } from '@/shared/utils';
import {
  CollectionActions,
  CollectionNameDialog,
  DeleteCollectionsDialog,
  MoveCollectionDialog,
  ShareCollectionDialog,
  UploadTile,
  UserCollectionCard,
} from '@/features/customer/components';
import { DownloadAllDialog } from './DownloadAllDialog';

type Dialog = 'newInside' | 'rename' | 'move' | 'share' | 'delete' | 'downloadAll' | null;
const allOptions = ''; // the first option of each filter dropdown: no filter
const collectionsType = 'collections'; // the type filter's option for the collections inside (no item has this type)

// One of the user's collections: the collections inside it, then its items and the user's own files, in one grid,
// with a filter bar (search, type, source, downloaded) and its actions as icon buttons (upload, "Download all").
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
  const { session } = useSession();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState(allOptions);
  const [source, setSource] = useState(allOptions);
  const [downloadState, setDownloadState] = useState(allOptions);
  const [uploading, setUploading] = useState(false);
  const items = useAsync(() => api.getItemsByIds(collection.itemIds), [collection.itemIds.join()], () => false);
  const loadedItems = items.status === 'success' ? items.data : []; // for the type filter's options
  const parent = collections.find((candidate) => candidate.id === collection.parentId);
  const children = collections.filter((candidate) => candidate.parentId === collection.id);
  const depth = (function measure(current: UserCollection | undefined): number {
    return current ? 1 + measure(collections.find((candidate) => candidate.id === current.parentId)) : 0;
  })(collection);
  const downloadedIds = new Set(session.status === 'signedIn' ? session.user.downloads.map((download) => download.itemId) : []);

  const { run, error } = useAccountAction();

  const upload = async (file: File) => {
    setUploading(true);
    await run(() => libraryApi.uploadToCollection(collection.id, file));
    setUploading(false);
  };

  // An item matches when it passes every filter that is set.
  const showItem = (item: Item) =>
    (!type || type === item.categoryId) &&
    (!source || source === 'library') &&
    (!downloadState || downloadState === (downloadedIds.has(item.id) ? 'downloaded' : 'notDownloaded')) &&
    matchesText(query, item.title[locale], item.creator.name, ...item.tags);
  // Uploads are never "downloaded": they are the user's own files.
  const shownUploads = collection.uploads.filter(
    (file) =>
      (!type || type === file.kind) &&
      (!source || source === 'upload') &&
      (!downloadState || downloadState === 'notDownloaded') &&
      matchesText(query, file.name),
  );

  // Collections inside are listed with the items, first, like folders before files. Only the search narrows them:
  // the other filters are about items.
  const itemFiltersSet = Boolean((type && type !== collectionsType) || source || downloadState);
  const shownChildren = itemFiltersSet ? [] : children.filter((child) => matchesText(query, child.name));

  return (
    <Page
      title={collection.name}
      gap={vars.spacing[5]}
      backTo={parent ? myCollectionPath(parent.id) : myCollectionsPath(scope)}
      backLabel={parent ? parent.name : scope === 'team' ? text.myCollections.scopes.team : text.myCollections.back}
    >
      {/* The main actions as icon buttons on the end, the rest in the "⋯" menu. */}
      <Stack direction="row" wrap align="center" justify="flex-end" gap={vars.spacing[3]}>
        <Stack direction="row" wrap gap={vars.spacing[2]}>
          <Button size="sm" iconOnly tooltip={text.myCollections.downloadAll} onClick={() => setDialog('downloadAll')} disabled={collection.itemIds.length === 0}>
            <Icon name="download" size={vars.sizes.icon.sm} />
          </Button>
          <FileInput
            label={text.myCollections.upload}
            accept={uploadKinds.map((kind) => `${kind}/*`).join(',')}
            icon="upload"
            size="sm"
            iconOnly
            busy={uploading ? text.myCollections.uploading : undefined}
            onSelect={(file) => void upload(file)}
          />
          {/* Share stays in view; New collection inside, Rename, Move, Pin and Delete are in the "⋯" menu. */}
          <CollectionActions
            pinned={collection.pinned}
            extraItems={
              depth < collectionMaxDepth ? [{ key: 'newInside', icon: 'plus', label: text.myCollections.newInside, onSelect: () => setDialog('newInside') }] : []
            }
            onAction={(action) => (action === 'pin' ? void run(() => libraryApi.setPinned(collection.id, !collection.pinned)) : setDialog(action))}
          />
        </Stack>
      </Stack>
      <FieldMessage tone="error" message={error} />

      {/* The site's search bar (without the catalog's extra tools) and three dropdowns whose first option
          ("All types"…) says what each one filters; they share the row and wrap on narrow screens. */}
      <FilterBar wideFirst label={text.filters.title}>
        <SearchBar
          suggest={false}
          label={text.myCollections.searchInside}
          placeholder={text.myCollections.searchInside}
          onChange={setQuery}
          onSearch={setQuery}
        />
        <Select
          label={text.myCollections.filterType}
          hideLabel
          value={type}
          onChange={setType}
          options={[
            { value: allOptions, label: text.myCollections.allTypes },
            ...(children.length > 0 ? [{ value: collectionsType, label: text.myCollections.typeCollections }] : []),
            ...[...new Set(loadedItems.map((item) => item.categoryId))].map((categoryId) => ({ value: categoryId, label: text.categories[categoryId].name })),
            ...[...new Set(collection.uploads.map((file) => file.kind))].map((kind) => ({ value: kind, label: text.myCollections.uploadKinds[kind] })),
          ]}
        />
        <Select
          label={text.myCollections.filterSource}
          hideLabel
          value={source}
          onChange={setSource}
          options={[
            { value: allOptions, label: text.myCollections.allSources },
            ...collectionSources.map((value) => ({ value, label: text.myCollections.sources[value] })),
          ]}
        />
        <Select
          label={text.myCollections.filterDownloaded}
          hideLabel
          value={downloadState}
          onChange={setDownloadState}
          options={[
            { value: allOptions, label: text.myCollections.anyDownloadStatus },
            ...collectionDownloadStates.map((value) => ({ value, label: text.myCollections.downloadStates[value] })),
          ]}
        />
      </FilterBar>

      <AsyncContent state={items}>
        {(data) => {
          const shownItems = data.filter(showItem);
          if (data.length === 0 && collection.uploads.length === 0 && children.length === 0) {
            return <EmptyState title={text.myCollections.emptyTitle} message={text.myCollections.emptyMessage} action={<Button to={routes.search}>{text.home.cta}</Button>} />;
          }
          if (shownChildren.length === 0 && shownItems.length === 0 && shownUploads.length === 0) {
            return <Text color={vars.colors.textMuted}>{text.search.noResultsInCategory}</Text>;
          }
          return (
            <Grid minColumnWidth={vars.sizes.itemCard.minWidth.medium} gap={vars.spacing[4]} ariaLabel={text.myCollections.contents}>
              {shownChildren.map((child) => (
                <UserCollectionCard
                  key={child.id}
                  collection={child}
                  to={myCollectionPath(child.id)}
                  childCount={collections.filter((other) => other.parentId === child.id).length}
                />
              ))}
              {shownItems.map((item) => (
                <li key={item.id}>
                  <ItemCard
                    item={item}
                    actions={
                      <Button
                        variant="ghost"
                        size="xs"
                        iconOnly
                        tooltip={text.myCollections.removeFromCollection}
                        tooltipAlign="end"
                        ariaLabel={`${text.myCollections.removeFromCollection} ${item.title[locale]}`}
                        onClick={() => void run(() => libraryApi.removeFromCollection(collection.id, { itemIds: [item.id] }))}
                      >
                        <Icon name="trash" size={vars.sizes.icon.sm} />
                      </Button>
                    }
                  />
                </li>
              ))}
              {shownUploads.map((file) => (
                <UploadTile key={file.id} upload={file} onRemove={() => void run(() => libraryApi.removeFromCollection(collection.id, { uploadIds: [file.id] }))} />
              ))}
            </Grid>
          );
        }}
      </AsyncContent>

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
