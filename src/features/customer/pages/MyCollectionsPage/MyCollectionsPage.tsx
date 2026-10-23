import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, EmptyState, FieldMessage, Grid, Icon, Page, Stack, Text, TextField } from '@/shared/components';
import { myCollectionPath } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { collectionTree, fillText, formatNumber, libraryApi, matchesText, safeAsync } from '@/shared/utils';
import {
  CollectionNameDialog,
  DeleteCollectionsDialog,
  ImportDialog,
  MoveCollectionDialog,
  ShareCollectionDialog,
  UserCollectionCard,
} from '@/features/customer/components';

type Dialog = 'new' | 'import' | 'rename' | 'move' | 'share' | 'delete' | null;

// "My collections": the user's own collections, pinned first. Search them, create or import one,
// or select some to rename, move, share, pin or delete. Only signed-in users reach this page.
export const MyCollectionsPage = () => {
  const { text, locale } = useLocale();
  const { session, setAccount } = useSession();
  const { requestError } = useMessages();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState<string>();
  const collections = session.status === 'signedIn' ? session.user.collections : [];

  // Searching looks through every level; otherwise the top level is listed.
  const shown = query.trim()
    ? collectionTree(collections).filter(({ collection }) => matchesText(query, collection.name))
    : collectionTree(collections).filter(({ depth }) => depth === 0);
  const single = selected.length === 1 ? collections.find((collection) => collection.id === selected[0]) : undefined;
  const allPinned = selected.length > 0 && selected.every((id) => collections.find((collection) => collection.id === id)?.pinned);

  const toggle = (id: string, on: boolean) => setSelected((current) => (on ? [...current, id] : current.filter((other) => other !== id)));
  const stopSelecting = () => {
    setSelecting(false);
    setSelected([]);
  };

  const pinSelected = async () => {
    let failed = false;
    for (const id of selected) {
      const result = await safeAsync(() => libraryApi.setPinned(id, !allPinned));
      if (result.ok) setAccount(result.data);
      else {
        failed = true;
        setError(requestError(result.error));
      }
    }
    if (!failed) setError(undefined);
  };

  return (
    <Page title={text.myCollections.title} subtitle={text.myCollections.subtitle} gap={vars.spacing[6]}>
      <Stack direction="row" wrap align="flex-end" gap={vars.spacing[3]}>
        <Stack grow>
          <TextField label={text.myCollections.search} value={query} onChange={setQuery} />
        </Stack>
        <Button onClick={() => setDialog('new')}>
          <Icon name="plus" size={vars.sizes.icon.sm} />
          {text.myCollections.new}
        </Button>
        <Button variant="outline" onClick={() => setDialog('import')}>
          <Icon name="upload" size={vars.sizes.icon.sm} />
          {text.myCollections.import}
        </Button>
        {collections.length > 0 && (
          <Button variant="outline" onClick={() => (selecting ? stopSelecting() : setSelecting(true))} pressed={selecting}>
            <Icon name="check" size={vars.sizes.icon.sm} />
            {selecting ? text.myCollections.cancelSelect : text.myCollections.select}
          </Button>
        )}
      </Stack>

      {selecting && (
        <Stack direction="row" wrap align="center" gap={vars.spacing[2]}>
          <Text as="span" variant="title">
            {fillText(text.myCollections.selectedCount, { count: formatNumber(selected.length, locale) })}
          </Text>
          <Button variant="outline" size="sm" onClick={() => setSelected(shown.map(({ collection }) => collection.id))}>
            {text.myCollections.selectAll}
          </Button>
          <Button variant="outline" size="sm" disabled={!single} onClick={() => setDialog('rename')}>
            <Icon name="pencil" size={vars.sizes.icon.sm} />
            {text.myCollections.rename}
          </Button>
          <Button variant="outline" size="sm" disabled={!single} onClick={() => setDialog('move')}>
            <Icon name="folder" size={vars.sizes.icon.sm} />
            {text.myCollections.move}
          </Button>
          <Button variant="outline" size="sm" disabled={!single} onClick={() => setDialog('share')}>
            <Icon name="share" size={vars.sizes.icon.sm} />
            {text.myCollections.share}
          </Button>
          <Button variant="outline" size="sm" disabled={selected.length === 0} onClick={() => void pinSelected()}>
            <Icon name="pin" size={vars.sizes.icon.sm} />
            {allPinned ? text.myCollections.unpin : text.myCollections.pin}
          </Button>
          <Button variant="danger" size="sm" disabled={selected.length === 0} onClick={() => setDialog('delete')}>
            <Icon name="trash" size={vars.sizes.icon.sm} />
            {text.myCollections.delete}
          </Button>
        </Stack>
      )}
      <FieldMessage tone="error" message={error} />

      {collections.length === 0 ? (
        <EmptyState
          title={text.myCollections.emptyTitle}
          message={text.myCollections.emptyMessage}
          action={<Button onClick={() => setDialog('new')}>{text.myCollections.new}</Button>}
        />
      ) : shown.length === 0 ? (
        <Text color={vars.colors.textMuted}>{fillText(text.myCollections.noMatch, { query })}</Text>
      ) : (
        <Grid minColumnWidth={vars.sizes.itemCard.minWidth.medium} gap={vars.spacing[4]} ariaLabel={text.myCollections.title}>
          {shown.map(({ collection }) => (
            <UserCollectionCard
              key={collection.id}
              collection={collection}
              to={myCollectionPath(collection.id)}
              childCount={collections.filter((child) => child.parentId === collection.id).length}
              selecting={selecting}
              selected={selected.includes(collection.id)}
              onToggle={(on) => toggle(collection.id, on)}
            />
          ))}
        </Grid>
      )}

      {dialog === 'new' && <CollectionNameDialog onClose={() => setDialog(null)} onCreated={(id) => navigate(myCollectionPath(id))} />}
      {dialog === 'import' && <ImportDialog onClose={() => setDialog(null)} onImported={(id) => navigate(myCollectionPath(id))} />}
      {dialog === 'rename' && single && <CollectionNameDialog collection={single} onClose={() => setDialog(null)} />}
      {dialog === 'move' && single && <MoveCollectionDialog collection={single} collections={collections} onClose={() => setDialog(null)} />}
      {dialog === 'share' && single && <ShareCollectionDialog collection={single} onClose={() => setDialog(null)} />}
      {dialog === 'delete' && <DeleteCollectionsDialog ids={selected} onClose={() => setDialog(null)} onDeleted={stopSelecting} />}
    </Page>
  );
};
