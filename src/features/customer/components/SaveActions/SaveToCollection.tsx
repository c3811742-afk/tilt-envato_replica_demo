import { useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router';
import { Button, Checkbox, FieldMessage, Icon, Modal, Stack, Text, TextField, TextLink, type ButtonSize } from '@/shared/components';
import { collectionNameMaxLength, routes, withReturnTo } from '@/shared/constants';
import { useAccountAction, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { UserCollection } from '@/shared/types';
import { collectionTree, fillText, formatNumber, libraryApi } from '@/shared/utils';
import styles from './SaveToCollection.module.css';

interface SaveToCollectionProps {
  itemId: string;
  size?: ButtonSize;
  iconOnly?: boolean; // a folder icon only, e.g. on a card
  subtle?: boolean; // a small borderless folder, for inside a card
  fullWidth?: boolean;
}

// "Save to collection": opens a side panel listing the user's collections (nested ones indented),
// where the item is added to or removed from each, or saved to a new collection.
export const SaveToCollection = ({ itemId, size = 'md', iconOnly = false, subtle = false, fullWidth = false }: SaveToCollectionProps) => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);

  const signedIn = session.status === 'signedIn';
  const teamCollections = (signedIn && session.team?.collections) || [];
  const savedIn = signedIn
    ? [...session.user.collections, ...teamCollections].filter((collection) => collection.itemIds.includes(itemId)).length
    : 0;

  const quiet = subtle ? ({ variant: 'ghost', size: 'xs', iconOnly: true } as const) : { size, iconOnly };
  const content = (
    <>
      {/* The quiet version has no dark background when saved, so the folder fills in instead. */}
      <Icon name="folder" size={vars.sizes.icon.sm} filled={subtle && savedIn > 0} />
      {!quiet.iconOnly && text.myCollections.saveTo}
    </>
  );

  if (!signedIn) {
    return (
      <Button variant="outline" {...quiet} fullWidth={fullWidth} to={withReturnTo(routes.signIn, `${pathname}${search}`)} ariaLabel={text.myCollections.signIn} tooltip={quiet.iconOnly ? text.myCollections.signIn : undefined} tooltipAlign="end">
        {content}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={savedIn > 0 ? 'secondary' : 'outline'}
        {...quiet}
        fullWidth={fullWidth}
        onClick={() => setOpen(true)}
        pressed={savedIn > 0}
        ariaLabel={quiet.iconOnly ? text.myCollections.saveTo : undefined}
        tooltip={quiet.iconOnly ? text.myCollections.saveTo : undefined}
        tooltipAlign="end" // the last button on a card: the name lines up with the card's edge
      >
        {content}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={text.myCollections.saveToTitle} placement="side">
        {savedIn > 0 && (
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {fillText(text.myCollections.savedIn, { count: formatNumber(savedIn, locale) })}
          </Text>
        )}
        {open && <CollectionPicker itemId={itemId} collections={session.user.collections} teamCollections={session.team ? teamCollections : undefined} />}
      </Modal>
    </>
  );
};

interface CollectionPickerProps {
  itemId: string;
  collections: UserCollection[];
  teamCollections?: UserCollection[]; // the team's shared collections, for team members
}

const CollectionPicker = ({ itemId, collections, teamCollections }: CollectionPickerProps) => {
  const { text } = useLocale();
  const { run, busy, error } = useAccountAction();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string>();

  const toggle = (collectionId: string) => run(() => libraryApi.toggleInCollection(collectionId, itemId));

  const create = async () => {
    if (!name.trim()) {
      setNameError(text.myCollections.nameRequired);
      return;
    }
    setNameError(undefined);
    if (await run(() => libraryApi.createCollection({ name, itemId }), (data) => data.account)) setName('');
  };

  return (
    <Stack gap={vars.spacing[5]}>
      {collections.length === 0 && !teamCollections?.length ? (
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {text.myCollections.emptyMessage}
        </Text>
      ) : (
        <Stack gap={vars.spacing[4]}>
          {[
            { key: 'own' as const, list: collections },
            { key: 'team' as const, list: teamCollections ?? [] },
          ]
            .filter((group) => group.list.length > 0)
            .map((group) => (
              <Stack key={group.key} gap={vars.spacing[2]}>
                {teamCollections && (
                  <Text as="h3" variant="label" color={vars.colors.textMuted}>
                    {text.myCollections.scopes[group.key]}
                  </Text>
                )}
                <Stack as="ul" gap={vars.spacing[2]}>
                  {collectionTree(group.list).map(({ collection, depth }) => (
                    <li key={collection.id} className={styles.row} style={{ '--depth': depth } as CSSProperties}>
                      <Checkbox label={collection.name} checked={collection.itemIds.includes(itemId)} disabled={busy} onChange={() => void toggle(collection.id)} />
                    </li>
                  ))}
                </Stack>
              </Stack>
            ))}
        </Stack>
      )}
      <Stack gap={vars.spacing[2]}>
        <TextField
          label={text.myCollections.new}
          placeholder={text.myCollections.name}
          value={name}
          onChange={setName}
          maxLength={collectionNameMaxLength}
          error={nameError}
        />
        <Button variant="outline" disabled={busy} onClick={() => void create()}>
          <Icon name="plus" size={vars.sizes.icon.sm} />
          {text.myCollections.create}
        </Button>
      </Stack>
      <FieldMessage tone="error" message={error} />
      <TextLink to={routes.myCollections} variant="bodySm">
        {text.nav.myCollections}
      </TextLink>
    </Stack>
  );
};
