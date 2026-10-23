import { useState, type ReactNode } from 'react';
import { useSession } from '@/shared/hooks';
import type { Item } from '@/shared/types';
import { accountAllowance } from '@/shared/utils';
import { GuestDownloadDialog } from './GuestDownloadDialog';
import { LicenseDialog } from './LicenseDialog';

interface ItemDownloadProps {
  item: Item;
  trigger: (open: () => void) => ReactNode; // the Download button
}

// A Download button and what it opens: the license dialog for subscribers and pass holders (and for any
// account on a free item of the month), otherwise a dialog that explains how to get the item.
// The dialogs are mounted only while open, so each download starts fresh.
export const ItemDownload = ({ item, trigger }: ItemDownloadProps) => {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const free = item.tier === 'free';
  const signedIn = session.status === 'signedIn';
  const canDownload = session.status === 'signedIn' && (free || accountAllowance(session).source !== null);

  return (
    <>
      {trigger(() => setOpen(true))}
      {open &&
        (canDownload && session.status === 'signedIn' ? (
          <LicenseDialog item={item} session={session} open onClose={() => setOpen(false)} />
        ) : (
          <GuestDownloadDialog signedIn={signedIn} free={free} open onClose={() => setOpen(false)} />
        ))}
    </>
  );
};
