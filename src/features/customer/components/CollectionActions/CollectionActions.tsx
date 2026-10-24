import { Button, Icon, Menu, Stack, type ButtonSize, type MenuItem } from '@/shared/components';
import type { IconName } from '@/shared/assets';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

export type CollectionAction = 'rename' | 'move' | 'share' | 'pin' | 'delete';

interface CollectionActionsProps {
  onAction: (action: CollectionAction) => void;
  shown?: CollectionAction[]; // as icon buttons (name on hover); the rest go in the "More actions" menu
  extraItems?: MenuItem[]; // more menu entries, listed first (e.g. "New collection inside")
  pinned?: boolean; // "Unpin" instead of "Pin"
  canEditOne?: boolean; // rename, move and share work on exactly one collection
  canEditAny?: boolean; // pin and delete work on one or more
  size?: ButtonSize;
}

// The actions on collections: the frequent ones as icon buttons, the others in a "⋯" menu with their full names.
// Used on the selected collections in "My collections" and on one collection's own page.
export const CollectionActions = ({
  onAction,
  shown = ['share'],
  extraItems = [],
  pinned = false,
  canEditOne = true,
  canEditAny = true,
  size = 'sm',
}: CollectionActionsProps) => {
  const { text } = useLocale();

  const actions: { key: CollectionAction; icon: IconName; label: string; enabled: boolean }[] = [
    { key: 'share', icon: 'share', label: text.myCollections.share, enabled: canEditOne },
    { key: 'rename', icon: 'pencil', label: text.myCollections.rename, enabled: canEditOne },
    { key: 'move', icon: 'folder', label: text.myCollections.move, enabled: canEditOne },
    { key: 'pin', icon: 'pin', label: pinned ? text.myCollections.unpin : text.myCollections.pin, enabled: canEditAny },
    { key: 'delete', icon: 'trash', label: text.myCollections.delete, enabled: canEditAny },
  ];
  const menuItems: MenuItem[] = [
    ...extraItems,
    ...actions
      .filter(({ key }) => !shown.includes(key))
      .map(({ key, icon, label, enabled }) => ({ key, icon, label, disabled: !enabled, danger: key === 'delete', onSelect: () => onAction(key) })),
  ];

  return (
    <Stack direction="row" align="center" gap={vars.spacing[2]}>
      {actions
        .filter(({ key }) => shown.includes(key))
        .map(({ key, icon, label, enabled }) => (
          <Button key={key} variant="outline" size={size} iconOnly tooltip={label} disabled={!enabled} onClick={() => onAction(key)}>
            <Icon name={icon} size={vars.sizes.icon.sm} />
          </Button>
        ))}
      {menuItems.length > 0 && <Menu label={text.common.moreActions} items={menuItems} />}
    </Stack>
  );
};
