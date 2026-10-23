import { useState } from 'react';
import { Badge, Button, Card, Icon, Stack, Text, TextLink } from '@/shared/components';
import { itemPath } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Download, Item, LicenseRecord } from '@/shared/types';
import { buildLicenseCertificate, buildProofLetter, downloadTextFile, fillText, formatDate, toFileName } from '@/shared/utils';
import { ItemDownload, ReportProblemDialog } from '@/features/customer/components';

interface DownloadRowProps {
  download: Download;
  license?: LicenseRecord; // as the license server has it
  item?: Item; // missing when the item has left the library
}

// One download: the item, project, use and license, its status, and what can be done with it.
export const DownloadRow = ({ download, license, item }: DownloadRowProps) => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const [reporting, setReporting] = useState(false);
  const revoked = license?.revoked;
  const removed = !item || Boolean(license?.itemRemoved);
  const musicLicense = item?.categoryId === 'music' || download.use === 'youtube';
  const channels = session.status === 'signedIn' ? session.user.youtubeChannels : [];

  return (
    <Card as="li" gap={vars.spacing[3]} padding={vars.spacing[4]}>
      <Stack direction="row" wrap align="flex-start" justify="space-between" gap={vars.spacing[3]}>
        <Stack gap={vars.spacing[1]}>
          {item ? (
            <TextLink to={itemPath(item.id)} variant="title" underline={false}>
              <bdi>{download.itemTitle}</bdi>
            </TextLink>
          ) : (
            <Text variant="title" autoDirection>
              {download.itemTitle}
            </Text>
          )}
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {[
              fillText(text.notifications.project, { project: download.projectName }),
              fillText(text.downloadsPage.use, { use: text.license.uses[download.use] }),
              formatDate(download.requestedAt, locale),
            ].join(' · ')}
          </Text>
          <Text variant="bodySm" color={vars.colors.textMuted}>
            <bdi>{fillText(text.downloadsPage.licenseCode, { code: download.licenseCode })}</bdi>
          </Text>
        </Stack>
        {revoked && <Badge variant="neutral">{text.licenseCheck.revoked}</Badge>}
      </Stack>

      {revoked && <Text variant="bodySm">{fillText(text.downloadsPage.revoked, { reason: text.revokeReasons[revoked.reason] })}</Text>}
      {!revoked && removed && <Text variant="bodySm">{text.downloadsPage.removed}</Text>}
      {download.reportedBroken && (
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {text.downloadsPage.reported}
        </Text>
      )}

      <Stack direction="row" wrap gap={vars.spacing[2]}>
        {license && !revoked && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadTextFile(`${toFileName(license.itemTitle)}-license.txt`, buildLicenseCertificate(license, text, locale))}
          >
            <Icon name="license" size={vars.sizes.icon.sm} />
            {text.downloadsPage.certificate}
          </Button>
        )}
        {license && !revoked && musicLicense && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadTextFile(`${toFileName(license.itemTitle)}-proof.txt`, buildProofLetter(license, channels, text, locale))}
          >
            <Icon name="shield" size={vars.sizes.icon.sm} />
            {text.downloadsPage.proof}
          </Button>
        )}
        {item && !removed && (
          <ItemDownload
            item={item}
            trigger={(open) => (
              <Button variant="outline" size="sm" onClick={open}>
                <Icon name="refresh" size={vars.sizes.icon.sm} />
                {text.downloadsPage.relicense}
              </Button>
            )}
          />
        )}
        {!download.reportedBroken && !revoked && (
          <Button variant="outline" size="sm" onClick={() => setReporting(true)}>
            <Icon name="flag" size={vars.sizes.icon.sm} />
            {text.downloadsPage.reportProblem}
          </Button>
        )}
      </Stack>

      {reporting && <ReportProblemDialog downloadId={download.id} onClose={() => setReporting(false)} />}
    </Card>
  );
};
