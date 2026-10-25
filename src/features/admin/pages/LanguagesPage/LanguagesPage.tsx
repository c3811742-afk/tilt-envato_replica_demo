import { useState } from 'react';
import { generatePath } from 'react-router';
import { fetchLanguages, setLanguagePublished } from '@/features/admin/api';
import { RequirePermission } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { SiteLanguage } from '@/features/admin/types';
import { AsyncContent, Badge, Button, Icon, Notice, type RecordColumn, recordRows, SectionHeader, Stack, Table, Text, TextLink } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatNumber, formatPercent, isolate } from '@/shared/utils';
import { AddLanguageModal } from './AddLanguageModal';

const Languages = () => {
  const { text, locale } = useLocale();
  const { can, currentAdmin } = useAdminSession();
  const languages = useAsync(fetchLanguages, []);
  const publish = useAdminAction();
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

  // Shows a language the team added in the site's language menu, or takes it out.
  const setPublished = async (list: SiteLanguage[], language: SiteLanguage, published: boolean) => {
    setNotice(null);
    const result = await publish.run(() => setLanguagePublished(currentAdmin.id, language.code, published));
    if (!result.ok) return;
    languages.update(list.map((current) => (current.code === language.code ? result.data : current)));
    setNotice(fillText(published ? t.shownNotice : t.hiddenNotice, { name: isolate(language.name) }));
  };

  const columns = (list: SiteLanguage[]): RecordColumn<SiteLanguage>[] => [
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
      key: 'onSite',
      label: t.onSite,
      render: (language) => (language.published ? <Badge variant="success">{t.shown}</Badge> : <Badge>{t.hidden}</Badge>),
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      // Every row ends with the same icon button, so the links before it line up too.
      render: (language) => (
        <Stack direction="row" justify="flex-end" align="center" gap={vars.spacing[3]}>
          {!language.isSource && (
            <TextLink to={generatePath(routes.adminTranslations, { languageCode: language.code })}>
              {t.review}
            </TextLink>
          )}
          {can('addLanguages') && (
            <Button
              size="sm"
              variant="outline"
              iconOnly
              tooltip={language.published ? t.hide : t.show}
              tooltipAlign="end"
              disabled={publish.busy}
              onClick={() => setPublished(list, language, !language.published)}
            >
              <Icon name={language.published ? 'eyeOff' : 'eye'} size={vars.sizes.icon.sm} />
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1"
        title={t.title}
        subtitle={t.description}
        actions={can('addLanguages') && <Button onClick={() => setAdding(true)}>{t.add}</Button>}
      >
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {t.fallbackNote}
        </Text>
      </SectionHeader>
      {publish.error && <Notice tone="danger">{publish.error}</Notice>}
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={languages}>
        {(list) => (
          <>
            <Table label={t.title} columns={columns(list)} rows={recordRows(list, (language) => language.code, columns(list))} stackOnMobile />
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
