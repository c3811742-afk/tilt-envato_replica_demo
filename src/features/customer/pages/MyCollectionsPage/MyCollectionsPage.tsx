import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, EmptyState, FieldMessage, Grid, Icon, Page, SearchBar, SegmentedControl, Stack, Text, TextLink } from '@/shared/components';
import { collectionScopeParam, myCollectionPath } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { collectionTree, fillText, formatNumber, libraryApi, matchesText, safeAsync } from '@/shared/utils';
import {
  CollectionActions,
  CollectionNameDialog,
  DeleteCollectionsDialog,
  ImportDialog,
  MoveCollectionDialog,
  ShareCollectionDialog,
  UserCollectionCard,
} from '@/features/customer/components';
import styles from './MyCollectionsPage.module.css';

type Dialog = 'new' | 'import' | 'rename' | 'move' | 'share' | 'delete' | null;

type Scope = 'own' | 'team';

// "My collections": the user's own collections, or their team's shared ones, pinned first. Search them, create
// or import one, or select some to rename, move, share, pin or delete. Only signed-in users reach this page.
export const MyCollectionsPage = () => {
  const { text, locale } = useLocale();
  const { session, setAccount } = useSession();
  const { requestError } = useMessages();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const team = session.status === 'signedIn' ? session.team : null;
  const scope: Scope = team && params.get(collectionScopeParam) === 'team' ? 'team' : 'own';
  const [query, setQuery] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState<string>();
  const collections = scope === 'team' ? (team?.collections ?? []) : session.status === 'signedIn' ? session.user.collections : [];

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
    <Page title={text.myCollections.title} subtitle={scope === 'team' ? text.team.collectionsText : text.myCollections.subtitle} gap={vars.spacing[6]}>
      {team && (
        <SegmentedControl<Scope>
          label={text.myCollections.title}
          value={scope}
          onChange={(next) => {
            stopSelecting();
            setParams(next === 'team' ? { [collectionScopeParam]: next } : {}, { replace: true });
          }}
          options={(['own', 'team'] as const).map((key) => ({ value: key, label: text.myCollections.scopes[key] }))}
        />
      )}
      {/* The site's search bar (without the catalog's extra tools), then the page's actions as icon buttons. */}
      <Stack direction="row" align="center" gap={vars.spacing[2]}>
        <Stack grow>
          <SearchBar suggest={false} label={text.myCollections.search} placeholder={text.myCollections.search} onChange={setQuery} onSearch={setQuery} />
        </Stack>
        <Button iconOnly tooltip={text.myCollections.new} onClick={() => setDialog('new')}>
          <Icon name="plus" size={vars.sizes.icon.md} />
        </Button>
        {scope === 'own' && (
          <Button variant="outline" iconOnly tooltip={text.myCollections.import} tooltipAlign={collections.length > 0 ? 'center' : 'end'} onClick={() => setDialog('import')}>
            <Icon name="upload" size={vars.sizes.icon.md} />
          </Button>
        )}
        {collections.length > 0 && (
          <Button
            variant="outline"
            iconOnly
            tooltip={selecting ? text.myCollections.cancelSelect : text.myCollections.select}
            tooltipAlign="end"
            pressed={selecting}
            onClick={() => (selecting ? stopSelecting() : setSelecting(true))}
          >
            <Icon name="check" size={vars.sizes.icon.md} />
          </Button>
        )}
      </Stack>

      {/* Select mode: one bar with the count, "Select all" and what can be done with the selection. */}
      {selecting && (
        <div className={styles.selectionBar}>
          <Text as="span" variant="title">
            {fillText(text.myCollections.selectedCount, { count: formatNumber(selected.length, locale) })}
          </Text>
          <TextLink variant="bodySm" onClick={() => setSelected(shown.map(({ collection }) => collection.id))}>
            {text.myCollections.selectAll}
          </TextLink>
          <span className={styles.spacer} />
          <CollectionActions
            shown={['share', 'delete']}
            pinned={allPinned}
            canEditOne={single !== undefined}
            canEditAny={selected.length > 0}
            onAction={(action) => (action === 'pin' ? void pinSelected() : setDialog(action))}
          />
          <Button variant="ghost" size="sm" iconOnly tooltip={text.myCollections.cancelSelect} tooltipAlign="end" onClick={stopSelecting}>
            <Icon name="close" size={vars.sizes.icon.sm} />
          </Button>
        </div>
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

      {dialog === 'new' && <CollectionNameDialog team={scope === 'team'} onClose={() => setDialog(null)} onCreated={(id) => navigate(myCollectionPath(id))} />}
      {dialog === 'import' && <ImportDialog onClose={() => setDialog(null)} onImported={(id) => navigate(myCollectionPath(id))} />}
      {dialog === 'rename' && single && <CollectionNameDialog collection={single} onClose={() => setDialog(null)} />}
      {dialog === 'move' && single && <MoveCollectionDialog collection={single} collections={collections} onClose={() => setDialog(null)} />}
      {dialog === 'share' && single && <ShareCollectionDialog collection={single} onClose={() => setDialog(null)} />}
      {dialog === 'delete' && <DeleteCollectionsDialog ids={selected} onClose={() => setDialog(null)} onDeleted={stopSelecting} />}
    </Page>
  );
};
