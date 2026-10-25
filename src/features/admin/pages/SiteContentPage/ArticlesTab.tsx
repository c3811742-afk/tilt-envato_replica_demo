import { useState } from 'react';
import { deleteArticle, fetchArticles } from '@/features/admin/api';
import { articleStatusTone, articleTabKind } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Article } from '@/features/admin/types';
import { localized, removeById } from '@/features/admin/utils';
import { AsyncContent, Badge, Button, ConfirmModal, EmptyState, Icon, Notice, type RecordColumn, recordRows, Stack, Table, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, isolate } from '@/shared/utils';
import { ArticleModal } from './ArticleModal';

interface ArticlesTabProps {
  tab: keyof typeof articleTabKind;
}

// Help Center articles, Learn articles or What's New posts: one list and one editor for all three.
export const ArticlesTab = ({ tab }: ArticlesTabProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const kind = articleTabKind[tab];
  const articles = useAsync(() => fetchArticles(kind), [kind]);
  const action = useAdminAction();
  const [editing, setEditing] = useState<Article | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Article | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.content.article;
  const labels = text.admin.content.articleTabs[tab];
  const current = articles.status === 'success' ? articles.data : [];
  const titleOf = (article: Article) => isolate(localized(article.title, locale));

  const remove = async () => {
    if (!deleting) return;
    const result = await action.run(() => deleteArticle(currentAdmin.id, deleting.id));
    if (!result.ok) return;
    articles.update(removeById(current, deleting.id));
    setNotice(fillText(t.deleted, { title: titleOf(deleting) }));
    setDeleting(null);
  };

  const columns: RecordColumn<Article>[] = [
    {
      key: 'title',
      label: text.admin.columns.title,
      render: (article) => (
        <Text as="span" autoDirection>
          {localized(article.title, locale)}
        </Text>
      ),
    },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (article) => <Badge variant={articleStatusTone[article.status]}>{t.statuses[article.status]}</Badge>,
    },
    {
      key: 'updated',
      label: text.admin.columns.updated,
      render: (article) => formatDate(article.updatedAt, locale),
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (article) => (
        <Stack direction="row" justify="flex-end" gap={vars.spacing[2]}>
          <Button size="sm" variant="outline" iconOnly tooltip={text.admin.common.edit} onClick={() => setEditing(article)}>
            <Icon name="pencil" size={vars.sizes.icon.sm} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            iconOnly
            tooltip={text.admin.common.delete}
            tooltipAlign="end"
            onClick={() => {
              action.clearError();
              setDeleting(article);
            }}
          >
            <Icon name="trash" size={vars.sizes.icon.sm} />
          </Button>
        </Stack>
      ),
    },
  ];

  const addButton = <Button onClick={() => setEditing('new')}>{labels.add}</Button>;

  return (
    <Stack>
      <Stack direction="row" wrap align="center">
        <Text color={vars.colors.textMuted}>{labels.description}</Text>
        {current.length > 0 && addButton}
      </Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent
        state={articles}
        empty={<EmptyState title={labels.emptyTitle} message={labels.emptyMessage} action={addButton} />}
      >
        {(list) => (
          <Table label={labels.tableLabel} columns={columns} rows={recordRows(list, (article) => article.id, columns)} stackOnMobile />
        )}
      </AsyncContent>
      {editing && (
        <ArticleModal
          kind={kind}
          article={editing === 'new' ? undefined : editing}
          labels={labels}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            // Most recently changed first, like the server sorts them.
            articles.update([saved, ...removeById(current, saved.id)]);
            setEditing(null);
            setNotice(fillText(saved.status === 'published' ? t.published : t.savedDraft, { title: titleOf(saved) }));
          }}
        />
      )}
      {deleting && (
        <ConfirmModal
          title={labels.deleteTitle}
          confirmLabel={text.admin.common.delete}
          tone="danger"
          message={t.deleteMessage}
          pending={action.busy}
          error={action.error}
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        >
          <Text autoDirection>
            <strong>{localized(deleting.title, locale)}</strong>
          </Text>
        </ConfirmModal>
      )}
    </Stack>
  );
};
