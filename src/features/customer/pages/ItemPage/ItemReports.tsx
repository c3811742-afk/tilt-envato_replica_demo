import { useState } from 'react';
import { useLocation } from 'react-router';
import { Stack, TextLink } from '@/shared/components';
import { routes, withReturnTo } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item } from '@/shared/types';
import { CopyrightReportDialog, ReportProblemDialog } from '@/features/customer/components';

// Under the item's actions: "Report a problem" with a file the user downloaded, and "Report copyright infringement".
export const ItemReports = ({ item }: { item: Item }) => {
  const { text } = useLocale();
  const { session } = useSession();
  const { pathname } = useLocation();
  const [open, setOpen] = useState<'problem' | 'copyright' | null>(null);
  const download = session.status === 'signedIn' ? session.user.downloads.find((candidate) => candidate.itemId === item.id && !candidate.reportedBroken) : undefined;

  return (
    <Stack gap={vars.spacing[1]} align="flex-start">
      {download && (
        <TextLink variant="bodySm" onClick={() => setOpen('problem')}>
          {text.downloadsPage.reportProblem}
        </TextLink>
      )}
      {session.status === 'signedIn' ? (
        <TextLink variant="bodySm" onClick={() => setOpen('copyright')}>
          {text.copyright.link}
        </TextLink>
      ) : (
        <TextLink variant="bodySm" to={withReturnTo(routes.signIn, pathname)}>
          {text.copyright.link}
        </TextLink>
      )}
      {open === 'problem' && download && <ReportProblemDialog downloadId={download.id} onClose={() => setOpen(null)} />}
      {open === 'copyright' && <CopyrightReportDialog item={item} onClose={() => setOpen(null)} />}
    </Stack>
  );
};
