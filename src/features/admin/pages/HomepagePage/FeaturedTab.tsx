import { useState } from 'react';
import { fetchFeatured, moveFeatured, removeFeatured } from '@/features/admin/api';
import { Notice, ReorderButtons } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { FeaturedSlot, MoveDirection } from '@/features/admin/types';
import { fillText, isolate } from '@/features/admin/utils';
import {
  AsyncContent,
  Badge,
  Button,
  EmptyState,
  type RecordColumn,
  recordRows,
  Stack,
  Table,
  Text,
} from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';
import { AddFeaturedModal } from './AddFeaturedModal';

// The "Featured" row of the homepage: elements and collections, in the order shown.
export const FeaturedTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const featured = useAsync(fetchFeatured, []);
  const action = useAdminAction();
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.homepage.featured;
  const current = featured.status === 'success' ? featured.data : [];

  const move = async (slot: FeaturedSlot, direction: MoveDirection) => {
    setNotice(null);
    const result = await action.run(() => moveFeatured(currentAdmin.id, slot.id, direction));
    if (result.ok) featured.update(result.data);
  };

  const remove = async (slot: FeaturedSlot) => {
    setNotice(null);
    const result = await action.run(() => removeFeatured(currentAdmin.id, slot.id));
    if (!result.ok) return;
    featured.update(result.data);
    setNotice(fillText(t.removed, { title: isolate(slot.title) }));
  };

  const columns: RecordColumn<FeaturedSlot>[] = [
    {
      key: 'position',
      label: text.admin.columns.position,
      render: (slot) => formatNumber(current.indexOf(slot) + 1, locale),
    },
    {
      key: 'item',
      label: text.admin.columns.item,
      render: (slot) => (
        <Stack gap={vars.spacing[1]} align="flex-start">
          <Text as="span" autoDirection>
            {slot.title}
          </Text>
          <Badge variant={slot.kind === 'collection' ? 'info' : 'neutral'}>{text.admin.featuredKinds[slot.kind]}</Badge>
        </Stack>
      ),
    },
    {
      key: 'order',
      label: text.admin.columns.order,
      render: (slot) => {
        const index = current.indexOf(slot);
        return (
          <ReorderButtons
            label={fillText(text.admin.common.moveLabel, { name: isolate(slot.title) })}
            canMoveUp={index > 0}
            canMoveDown={index < current.length - 1}
            disabled={action.pending}
            onMove={(direction) => move(slot, direction)}
          />
        );
      },
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (slot) => (
        <Button size="sm" variant="muted" disabled={action.pending} onClick={() => remove(slot)}>
          {text.admin.common.remove}
        </Button>
      ),
    },
  ];

  const addButton = <Button onClick={() => setAdding(true)}>{t.add}</Button>;

  return (
    <Stack>
      <Stack direction="row" wrap align="center">
        <Text color={vars.colors.textMuted}>{t.description}</Text>
        {current.length > 0 && addButton}
      </Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {action.error && (
        <Notice tone="danger" onDismiss={action.clearError}>
          {action.error}
        </Notice>
      )}
      <AsyncContent
        state={featured}
        empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} action={addButton} />}
      >
        {(list) => <Table label={t.tableLabel} columns={columns} rows={recordRows(list, (slot) => slot.id, columns)} stackOnMobile />}
      </AsyncContent>
      {adding && (
        <AddFeaturedModal
          featured={current}
          onClose={() => setAdding(false)}
          onAdded={(list, title) => {
            featured.update(list);
            setAdding(false);
            setNotice(fillText(t.added, { title: isolate(title) }));
          }}
        />
      )}
    </Stack>
  );
};
