import { AsyncContent, Button, Icon, Section, Stack, Table, stateMessageHeights } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { buildLicenseCertificate, downloadTextFile, fillText, formatDate, teamApi, toFileName } from '@/shared/utils';

// "Use elements licensed by my team": every license on the team plan, with its certificate and the file again.
// Owners and admins also see who downloaded each one.
export const TeamLicenses = ({ showDownloader }: { showDownloader: boolean }) => {
  const { text, locale } = useLocale();
  const licenses = useAsync(teamApi.licenses, [], () => false);

  return (
    <Section title={text.team.licensesTitle} subtitle={text.team.licensesText} variant="h3" gap={vars.spacing[3]}>
      <AsyncContent state={licenses} minHeight={stateMessageHeights.compact}>
        {(data) => (
          <Table
            label={text.team.licensesTitle}
            columns={[
              { key: 'item', label: text.license.certificate.item },
              { key: 'project', label: text.license.certificate.project },
              { key: 'use', label: text.license.certificate.use },
              ...(showDownloader ? [{ key: 'by', label: text.team.downloadedBy }] : []),
              { key: 'date', label: text.license.certificate.issued },
              { key: 'actions', label: '', align: 'end' as const },
            ]}
            rows={data.map((license) => ({
              key: license.code,
              cells: {
                item: <bdi>{license.itemTitle}</bdi>,
                project: <bdi>{license.projectName}</bdi>,
                use: text.license.uses[license.use],
                by: <bdi>{license.downloadedBy}</bdi>,
                date: formatDate(license.issuedAt, locale),
                actions: (
                  <Stack direction="row" justify="flex-end" gap={vars.spacing[2]}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTextFile(`${toFileName(license.itemTitle)}-license.txt`, buildLicenseCertificate(license, text, locale))}
                    >
                      <Icon name="license" size={vars.sizes.icon.sm} />
                      {text.downloadsPage.certificate}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      ariaLabel={`${text.item.download} ${license.itemTitle}`}
                      onClick={() => downloadTextFile(`${toFileName(license.itemTitle)}.txt`, fillText(text.license.demoFile, { title: license.itemTitle }))}
                    >
                      <Icon name="download" size={vars.sizes.icon.sm} />
                    </Button>
                  </Stack>
                ),
              },
            }))}
            emptyText={text.team.licensesEmpty}
          />
        )}
      </AsyncContent>
    </Section>
  );
};
