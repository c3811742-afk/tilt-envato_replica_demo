import { useState } from 'react';
import { generatePath } from 'react-router';
import { fetchCategories, moveCategory, setCategoryHidden } from '@/features/admin/api';
import { Notice, ReorderButtons, RequirePermission } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Category, MoveDirection } from '@/features/admin/types';
import { categoryTree, fillText, isolate, localized, replaceById, upsertById } from '@/features/admin/utils';
import {
  AsyncContent,
  Badge,
  Button,
  EmptyState,
  type RecordColumn,
  recordRows,
  SectionHeader,
  Stack,
  Table,
  Text,
  TextLink,
} from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';
import { CategoryModal, type CategoryModalMode } from './CategoryModal';

const Categories = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const categories = useAsync(fetchCategories, []);
  const action = useAdminAction();
  const [modal, setModal] = useState<CategoryModalMode | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.categoryList;
  const nameOf = (category: Category) => isolate(localized(category.name, locale));

  const move = async (category: Category, direction: MoveDirection) => {
    setNotice(null);
    const result = await action.run(() => moveCategory(currentAdmin.id, category.id, direction));
    if (result.ok) categories.update(result.data);
  };

  const toggleHidden = async (list: Category[], category: Category) => {
    setNotice(null);
    const result = await action.run(() => setCategoryHidden(currentAdmin.id, category.id, !category.hidden));
    if (!result.ok) return;
    categories.update(replaceById(list, result.data));
    setNotice(fillText(result.data.hidden ? t.hiddenNotice : t.shownNotice, { name: nameOf(result.data) }));
  };

  const handleSaved = (list: Category[], category: Category) => {
    const isNew = !list.some((current) => current.id === category.id);
    categories.update(upsertById(list, category));
    setModal(null);
    setNotice(fillText(isNew ? t.created : t.saved, { name: nameOf(category) }));
  };

  const columns = (list: Category[]): RecordColumn<Category>[] => {
    const parentOf = (category: Category) => list.find((current) => current.id === category.parentId);
    const siblings = (category: Category) => list.filter((current) => current.parentId === category.parentId);

    return [
      {
        key: 'name',
        label: text.admin.columns.name,
        render: (category) => {
          const parent = parentOf(category);
          return (
            <Stack gap={vars.spacing[1]}>
              <TextLink to={generatePath(routes.adminCategory, { categoryId: category.id })} autoDirection>
                {localized(category.name, locale)}
              </TextLink>
              <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                {parent ? fillText(t.inParent, { name: nameOf(parent) }) : t.topLevel}
              </Text>
            </Stack>
          );
        },
      },
      {
        key: 'attributes',
        label: text.admin.columns.attributes,
        render: (category) => formatNumber(category.attributes.length, locale),
      },
      {
        key: 'status',
        label: text.admin.columns.status,
        render: (category) => {
          if (category.hidden) return <Badge variant="neutral">{t.hidden}</Badge>;
          if (parentOf(category)?.hidden) return <Badge variant="warning">{t.parentHidden}</Badge>;
          return <Badge variant="success">{t.visible}</Badge>;
        },
      },
      {
        key: 'order',
        label: text.admin.columns.order,
        render: (category) => {
          const group = siblings(category);
          const index = group.indexOf(category);
          return (
            <ReorderButtons
              label={fillText(text.admin.common.moveLabel, { name: nameOf(category) })}
              canMoveUp={index > 0}
              canMoveDown={index < group.length - 1}
              disabled={action.pending}
              onMove={(direction) => move(category, direction)}
            />
          );
        },
      },
      {
        key: 'actions',
        label: text.admin.columns.actions,
        render: (category) => (
          <Stack direction="row" wrap gap={vars.spacing[2]}>
            <Button size="sm" variant="muted" onClick={() => setModal({ kind: 'edit', category })}>
              {text.admin.common.edit}
            </Button>
            <Button size="sm" variant="muted" disabled={action.pending} onClick={() => toggleHidden(list, category)}>
              {category.hidden ? text.admin.common.show : text.admin.common.hide}
            </Button>
            {!category.parentId && (
              <Button size="sm" variant="muted" onClick={() => setModal({ kind: 'new', parentId: category.id })}>
                {t.addSub}
              </Button>
            )}
          </Stack>
        ),
      },
    ];
  };

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1"
        title={t.title}
        subtitle={t.description}
        actions={<Button onClick={() => setModal({ kind: 'new', parentId: null })}>{t.addSub}</Button>}
      />
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
      <AsyncContent state={categories} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
        {(list) => {
          // Each category is followed by its subcategories.
          const rows = categoryTree(list).flatMap(({ category, children }) => [category, ...children]);
          return (
            <>
              <Table label={t.tableLabel} columns={columns(list)} rows={recordRows(rows, (row) => row.id, columns(list))} stackOnMobile />
              {modal && (
                <CategoryModal
                  mode={modal}
                  categories={list}
                  onClose={() => setModal(null)}
                  onSaved={(category) => handleSaved(list, category)}
                />
              )}
            </>
          );
        }}
      </AsyncContent>
    </Stack>
  );
};

export const CategoriesPage = () => (
  <RequirePermission permission="manageCatalog">
    <Categories />
  </RequirePermission>
);
