import { useState } from 'react';
import { AsyncContent, Button, EmptyState, Icon, Page, Stack, Text, TextField } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item, LicenseRecord } from '@/shared/types';
import { api, buildLicensesFile, downloadTextFile, fillText, libraryApi, matchesText } from '@/shared/utils';
import { DownloadRow } from './DownloadRow';

// "Downloads and licenses": every download with its license, newest first. A license shows here as the
// license server has it (revoked, or its item removed from the library). Only signed-in users reach this page.
export const DownloadsPage = () => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const [query, setQuery] = useState('');
  const downloads = session.status === 'signedIn' ? session.user.downloads : [];
  const data = useAsync(
    async () => {
      const [licenses, items] = await Promise.all([libraryApi.myLicenses(), api.getItemsByIds([...new Set(downloads.map((download) => download.itemId))])]);
      return {
        licenses: new Map<string, LicenseRecord>(licenses.map((license) => [license.code, license])),
        items: new Map<string, Item>(items.map((item) => [item.id, item])),
      };
    },
    [downloads.length],
    () => downloads.length === 0,
  );

  return (
    <Page title={text.downloadsPage.title} subtitle={text.downloadsPage.subtitle}>
      <AsyncContent
        state={data}
        empty={
          <EmptyState
            title={text.downloadsPage.emptyTitle}
            message={text.downloadsPage.emptyMessage}
            action={<Button to={routes.search}>{text.home.cta}</Button>}
          />
        }
      >
        {({ licenses, items }) => {
          const shown = downloads.filter((download) => matchesText(query, download.itemTitle, download.projectName, download.licenseCode));
          const all = [...licenses.values()];
          return (
            <Stack gap={vars.spacing[5]}>
              <Stack direction="row" wrap align="flex-end" justify="space-between" gap={vars.spacing[3]}>
                <Stack grow>
                  <TextField label={text.downloadsPage.search} value={query} onChange={setQuery} />
                </Stack>
                <Button variant="outline" onClick={() => downloadTextFile(`${text.downloadsPage.allLicensesFile}.txt`, buildLicensesFile(all, text, locale))}>
                  <Icon name="download" size={vars.sizes.icon.sm} />
                  {text.downloadsPage.downloadAll}
                </Button>
              </Stack>
              {shown.length === 0 ? (
                <Text color={vars.colors.textMuted}>{fillText(text.search.noResultsMessage, { query })}</Text>
              ) : (
                <Stack as="ul" gap={vars.spacing[3]}>
                  {shown.map((download) => (
                    <DownloadRow key={download.id} download={download} license={licenses.get(download.licenseCode)} item={items.get(download.itemId)} />
                  ))}
                </Stack>
              )}
            </Stack>
          );
        }}
      </AsyncContent>
    </Page>
  );
};
