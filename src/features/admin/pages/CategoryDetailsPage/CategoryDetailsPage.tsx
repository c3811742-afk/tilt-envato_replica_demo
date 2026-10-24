import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { fetchCategory, moveAttribute, removeAttribute } from '@/features/admin/api';
import {
  Badge,
  ConfirmModal,
  DataTable,
  Notice,
  PageHeader,
  Panel,
  ReorderButtons,
  RequirePermission,
  Stack,
  TextLink,
  type DataTableColumn,
} from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Category, CategoryAttribute, MoveDirection } from '@/features/admin/types';
import { fillText, formatList, isolate, localized } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { AttributeModal } from './AttributeModal';

interface CategoryDetailsViewProps {
  category: Category;
  onChange: (category: Category) => void;
}

const CategoryDetailsView = ({ category, onChange }: CategoryDetailsViewProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const action = useAdminAction();
  const [editing, setEditing] = useState<CategoryAttribute | 'new' | null>(null);
  const [removing, setRemoving] = useState<CategoryAttribute | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.categoryDetails;
  const attributeName = (attribute: CategoryAttribute) => isolate(localized(attribute.name, locale));

  const move = async (attribute: CategoryAttribute, direction: MoveDirection) => {
    setNotice(null);
    const result = await action.run(() => moveAttribute(currentAdmin.id, category.id, attribute.id, direction));
    if (result.ok) onChange(result.data);
  };

  const remove = async () => {
    if (!removing) return;
    const result = await action.run(() => removeAttribute(currentAdmin.id, category.id, removing.id));
    if (!result.ok) return;
    onChange(result.data);
    setNotice(fillText(t.removed, { name: attributeName(removing) }));
    setRemoving(null);
  };

  const handleSaved = (saved: Category) => {
    onChange(saved);
    setEditing(null);
    setNotice(fillText(t.saved, { name: isolate(localized(saved.name, locale)) }));
  };

  const count = category.attributes.length;
  const columns: DataTableColumn<CategoryAttribute>[] = [
    {
      key: 'name',
      header: text.admin.columns.name,
      render: (attribute) => (
        <Text as="span" autoDirection>
          {localized(attribute.name, locale)}
        </Text>
      ),
    },
    { key: 'type', header: text.admin.columns.type, render: (attribute) => text.admin.attributeTypes[attribute.type] },
    {
      key: 'options',
      header: text.admin.columns.options,
      render: (attribute) =>
        attribute.options.length > 0 ? (
          <Text as="span" autoDirection>
            {formatList(attribute.options, locale, 'unit')}
          </Text>
        ) : (
          <Text as="span" color={vars.colors.textMuted}>
            {text.admin.common.none}
          </Text>
        ),
    },
    {
      key: 'filter',
      header: text.admin.columns.filter,
      render: (attribute) =>
        attribute.isFilter ? <Badge tone="info">{t.filterYes}</Badge> : <Badge>{t.filterNo}</Badge>,
    },
    {
      key: 'order',
      header: text.admin.columns.order,
      render: (attribute) => {
        const index = category.attributes.indexOf(attribute);
        return (
          <ReorderButtons
            label={fillText(text.admin.common.moveLabel, { name: attributeName(attribute) })}
            canMoveUp={index > 0}
            canMoveDown={index < count - 1}
            disabled={action.pending}
            onMove={(direction) => move(attribute, direction)}
          />
        );
      },
    },
    {
      key: 'actions',
      header: text.admin.columns.actions,
      render: (attribute) => (
        <Stack direction="row" gap={vars.spacing[2]}>
          <Button size="sm" variant="muted" onClick={() => setEditing(attribute)}>
            {text.admin.common.edit}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              action.clearError();
              setRemoving(attribute);
            }}
          >
            {text.admin.common.remove}
          </Button>
        </Stack>
      ),
    },
  ];

  const addButton = <Button onClick={() => setEditing('new')}>{t.addAttribute}</Button>;

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader
        title={localized(category.name, locale)}
        description={t.description}
        autoDirection
        actions={category.hidden && <Badge>{text.admin.categoryList.hidden}</Badge>}
      />
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {action.error && !removing && (
        <Notice tone="danger" onDismiss={action.clearError}>
          {action.error}
        </Notice>
      )}
      <Panel title={t.namesTitle}>
        <Stack gap={vars.spacing[2]}>
          <Text>{fillText(t.nameIn, { language: text.admin.languageNames.en, name: isolate(category.name.en) })}</Text>
          <Text>{fillText(t.nameIn, { language: text.admin.languageNames.ar, name: isolate(category.name.ar) })}</Text>
        </Stack>
      </Panel>
      <Panel title={t.attributesTitle}>
        {count > 0 ? (
          <Stack>
            <Stack direction="row" align="center">
              {addButton}
            </Stack>
            <DataTable
              label={t.attributesTitle}
              columns={columns}
              rows={category.attributes}
              getRowKey={(attribute) => attribute.id}
            />
          </Stack>
        ) : (
          <EmptyState title={t.noAttributesTitle} message={t.noAttributesMessage} action={addButton} />
        )}
      </Panel>
      {editing && (
        <AttributeModal
          categoryId={category.id}
          attribute={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {removing && (
        <ConfirmModal
          title={t.removeTitle}
          confirmLabel={text.admin.common.remove}
          tone="danger"
          message={t.removeMessage}
          pending={action.pending}
          error={action.error}
          onConfirm={remove}
          onClose={() => setRemoving(null)}
        >
          <Text autoDirection>
            <strong>{localized(removing.name, locale)}</strong>
          </Text>
        </ConfirmModal>
      )}
    </Stack>
  );
};

const CategoryDetails = () => {
  const { categoryId = '' } = useParams();
  const { text } = useLocale();
  const navigate = useNavigate();
  const category = useAsync(() => fetchCategory(categoryId), [categoryId]);
  const t = text.admin.categoryDetails;

  return (
    <Stack>
      <TextLink to={routes.adminCategories}>{t.back}</TextLink>
      <AsyncContent
        state={category}
        empty={
          <EmptyState
            title={t.notFoundTitle}
            message={t.notFoundMessage}
            action={<Button onClick={() => navigate(routes.adminCategories)}>{t.back}</Button>}
          />
        }
      >
        {(data) => data && <CategoryDetailsView category={data} onChange={category.update} />}
      </AsyncContent>
    </Stack>
  );
};

export const CategoryDetailsPage = () => (
  <RequirePermission permission="manageCatalog">
    <CategoryDetails />
  </RequirePermission>
);
