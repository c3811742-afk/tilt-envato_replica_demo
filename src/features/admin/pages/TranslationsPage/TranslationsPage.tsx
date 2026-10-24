import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { fetchTranslations } from '@/features/admin/api';
import { FilterBar, Notice, RequirePermission } from '@/features/admin/components';
import { translationsPageSize } from '@/features/admin/constants';
import type { TranslationEntry, Translations } from '@/features/admin/types';
import { fillText, isBlank, isolate, matchesQuery } from '@/features/admin/utils';
import {
  AsyncContent,
  Badge,
  Button,
  Checkbox,
  EmptyState,
  type RecordColumn,
  recordRows,
  SectionHeader,
  Stack,
  Table,
  Text,
  TextField,
  TextLink,
} from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';
import { EditTranslationModal } from './EditTranslationModal';

interface TranslationsViewProps {
  data: Translations;
  onChange: (data: Translations) => void;
}

const TranslationsView = ({ data, onChange }: TranslationsViewProps) => {
  const { text, locale } = useLocale();
  const { language, entries } = data;
  const [query, setQuery] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);
  const [shown, setShown] = useState(translationsPageSize);
  const [editing, setEditing] = useState<TranslationEntry | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.translations;

  const missing = entries.filter((entry) => isBlank(entry.value)).length;
  const visible = entries.filter(
    (entry) =>
      (!missingOnly || isBlank(entry.value)) && matchesQuery(query, [entry.key, entry.source, entry.value]),
  );

  const resetPaging = () => setShown(translationsPageSize);

  const handleSaved = (saved: TranslationEntry) => {
    const next = entries.map((entry) => (entry.key === saved.key ? saved : entry));
    const translated = next.filter((entry) => !isBlank(entry.value)).length;
    onChange({ language: { ...language, translated }, entries: next });
    setEditing(null);
    setNotice(fillText(t.saved, { key: isolate(saved.key) }));
  };

  const columns: RecordColumn<TranslationEntry>[] = [
    {
      key: 'key',
      label: text.admin.columns.key,
      render: (entry) => (
        <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
          <bdi>{entry.key}</bdi>
        </Text>
      ),
    },
    {
      key: 'english',
      label: text.admin.languageNames.en,
      render: (entry) => (
        <Text as="span">
          <bdi lang="en">{entry.source}</bdi>
        </Text>
      ),
    },
    {
      key: 'translation',
      label: language.name,
      render: (entry) =>
        isBlank(entry.value) ? (
          <Badge variant="warning">{t.missing}</Badge>
        ) : (
          <Text as="span">
            <bdi lang={language.code} dir={language.direction}>
              {entry.value}
            </bdi>
          </Text>
        ),
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (entry) => (
        <Button size="sm" variant="muted" onClick={() => setEditing(entry)}>
          {text.admin.common.edit}
        </Button>
      ),
    },
  ];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1"
        title={fillText(t.title, { language: isolate(language.name) })}
        subtitle={fillText(t.progress, {
          translated: formatNumber(language.translated, locale),
          total: formatNumber(language.total, locale),
          missing: formatNumber(missing, locale),
        })}
      />
      <Notice tone="info">{t.demoNote}</Notice>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <FilterBar>
        <TextField
          type="search"
          label={text.admin.common.search}
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(value) => {
            setQuery(value);
            resetPaging();
          }}
        />
        <Checkbox
          label={t.missingOnly}
          checked={missingOnly}
          onChange={(checked) => {
            setMissingOnly(checked);
            resetPaging();
          }}
        />
      </FilterBar>
      {visible.length > 0 ? (
        <Stack>
          <Text color={vars.colors.textMuted}>
            {fillText(t.showing, {
              shown: formatNumber(Math.min(shown, visible.length), locale),
              total: formatNumber(visible.length, locale),
            })}
          </Text>
          <Table
            label={fillText(t.title, { language: isolate(language.name) })}
            columns={columns} rows={recordRows(visible.slice(0, shown), (entry) => entry.key, columns)} stackOnMobile
           
           
          />
          {shown < visible.length && (
            <Stack direction="row" wrap>
              <Button variant="muted" onClick={() => setShown((count) => count + translationsPageSize)}>
                {t.showMore}
              </Button>
            </Stack>
          )}
        </Stack>
      ) : (
        <EmptyState
          title={text.admin.common.noMatchesTitle}
          message={missingOnly && !query ? t.noneMissing : t.noMatchesMessage}
          action={
            <Button
              onClick={() => {
                setQuery('');
                setMissingOnly(false);
              }}
            >
              {text.admin.common.clearFilters}
            </Button>
          }
        />
      )}
      {editing && (
        <EditTranslationModal
          language={language}
          entry={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </Stack>
  );
};

const TranslationsScreen = () => {
  const { languageCode = '' } = useParams();
  const { text } = useLocale();
  const navigate = useNavigate();
  const translations = useAsync(() => fetchTranslations(languageCode), [languageCode]);
  const t = text.admin.translations;

  return (
    <Stack>
      <TextLink to={routes.adminLanguages}>{t.back}</TextLink>
      <AsyncContent
        state={translations}
        empty={
          <EmptyState
            title={t.notFoundTitle}
            message={t.notFoundMessage}
            action={<Button onClick={() => navigate(routes.adminLanguages)}>{t.back}</Button>}
          />
        }
      >
        {(data) => data && <TranslationsView data={data} onChange={translations.update} />}
      </AsyncContent>
    </Stack>
  );
};

export const TranslationsPage = () => (
  <RequirePermission permission="manageTranslations">
    <TranslationsScreen />
  </RequirePermission>
);
