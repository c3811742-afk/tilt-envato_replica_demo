import { useState } from 'react';
import { generatePath } from 'react-router';
import { fetchLanguages } from '@/features/admin/api';
import { Notice, RequirePermission } from '@/features/admin/components';
import { useAdminSession } from '@/features/admin/hooks';
import type { SiteLanguage } from '@/features/admin/types';
import { fillText, isolate } from '@/features/admin/utils';
import {
  AsyncContent,
  Badge,
  Button,
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
import { formatNumber, formatPercent } from '@/shared/utils';
import { AddLanguageModal } from './AddLanguageModal';

const Languages = () => {
  const { text, locale } = useLocale();
  const { can } = useAdminSession();
  const languages = useAsync(fetchLanguages, []);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.languages;

  const progress = (language: SiteLanguage) => {
    const share = language.total ? language.translated / language.total : 0;
    return fillText(t.progress, {
      translated: formatNumber(language.translated, locale),
      total: formatNumber(language.total, locale),
      percent: formatPercent(share, locale),
    });
  };

  const columns: RecordColumn<SiteLanguage>[] = [
    {
      key: 'language',
      label: text.admin.columns.language,
      render: (language) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">{language.name}</Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted} autoDirection>
            {language.nativeName}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'code',
      label: text.admin.columns.code,
      render: (language) => (
        <Text as="span">
          <bdi>{language.code}</bdi>
        </Text>
      ),
    },
    { key: 'direction', label: text.admin.columns.direction, render: (language) => t.directions[language.direction] },
    {
      key: 'progress',
      label: text.admin.columns.progress,
      render: (language) =>
        language.isSource ? (
          <Badge variant="info">{t.source}</Badge>
        ) : (
          <Stack gap={vars.spacing[1]} align="flex-start">
            <Text as="span">{progress(language)}</Text>
            {language.translated === language.total ? (
              <Badge variant="success">{t.complete}</Badge>
            ) : (
              <Badge variant="warning">{t.incomplete}</Badge>
            )}
          </Stack>
        ),
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      render: (language) =>
        !language.isSource && (
          <TextLink to={generatePath(routes.adminTranslations, { languageCode: language.code })}>
            {t.review}
          </TextLink>
        ),
    },
  ];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1"
        title={t.title}
        subtitle={t.description}
        actions={can('addLanguages') && <Button onClick={() => setAdding(true)}>{t.add}</Button>}
      />
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={languages}>
        {(list) => (
          <>
            <Table label={t.title} columns={columns} rows={recordRows(list, (language) => language.code, columns)} stackOnMobile />
            {adding && (
              <AddLanguageModal
                onClose={() => setAdding(false)}
                onAdded={(language) => {
                  languages.update([...list, language]);
                  setAdding(false);
                  setNotice(fillText(t.added, { name: isolate(language.name) }));
                }}
              />
            )}
          </>
        )}
      </AsyncContent>
    </Stack>
  );
};

export const LanguagesPage = () => (
  <RequirePermission permission="manageTranslations">
    <Languages />
  </RequirePermission>
);
