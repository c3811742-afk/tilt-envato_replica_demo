import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { fetchCategory, moveAttribute, removeAttribute } from '@/features/admin/api';
import { ConfirmModal, Notice, ReorderButtons, RequirePermission } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Category, CategoryAttribute, MoveDirection } from '@/features/admin/types';
import { fillText, formatList, isolate, localized } from '@/features/admin/utils';
import {
  AsyncContent,
  Badge,
  Button,
  Card,
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
  const columns: RecordColumn<CategoryAttribute>[] = [
    {
      key: 'name',
      label: text.admin.columns.name,
      render: (attribute) => (
        <Text as="span" autoDirection>
          {localized(attribute.name, locale)}
        </Text>
      ),
    },
    { key: 'type', label: text.admin.columns.type, render: (attribute) => text.admin.attributeTypes[attribute.type] },
    {
      key: 'options',
      label: text.admin.columns.options,
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
      label: text.admin.columns.filter,
      render: (attribute) =>
        attribute.isFilter ? <Badge variant="info">{t.filterYes}</Badge> : <Badge>{t.filterNo}</Badge>,
    },
    {
      key: 'order',
      label: text.admin.columns.order,
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
      label: text.admin.columns.actions,
      render: (attribute) => (
        <Stack direction="row" wrap gap={vars.spacing[2]}>
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
      <SectionHeader as="h1"
        title={localized(category.name, locale)}
        subtitle={t.description}
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
      <Card title={t.namesTitle}>
        <Stack gap={vars.spacing[2]}>
          <Text>{fillText(t.nameIn, { language: text.admin.languageNames.en, name: isolate(category.name.en) })}</Text>
          <Text>{fillText(t.nameIn, { language: text.admin.languageNames.ar, name: isolate(category.name.ar) })}</Text>
        </Stack>
      </Card>
      <Card title={t.attributesTitle}>
        {count > 0 ? (
          <Stack>
            <Stack direction="row" wrap align="center">
              {addButton}
            </Stack>
            <Table
              label={t.attributesTitle}
              columns={columns} rows={recordRows(category.attributes, (attribute) => attribute.id, columns)} stackOnMobile
             
             
            />
          </Stack>
        ) : (
          <EmptyState title={t.noAttributesTitle} message={t.noAttributesMessage} action={addButton} />
        )}
      </Card>
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
