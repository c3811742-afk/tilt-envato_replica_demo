import { mockItems } from '@/shared/mocks';
import { accountPath, itemPath, licenseCheckPath, renewalReminderDays, routes, type RevokeReason, type SuspensionReason } from '@/shared/constants';
import {
  call,
  findByEmail,
  newAccount,
  readAccounts,
  readCatalogEvents,
  readLicenses,
  saveAccount,
  saveTeam,
  signedInAccount,
  teamOf,
  toSessionAccount,
  withAlert,
  writeAccounts,
  writeCatalogEvents,
  withDueReminders,
  writeLicenses,
} from './accountStore';
import { ApiError } from './apiError';
import { originalTitle } from './itemText';

const dayMs = 24 * 60 * 60 * 1000;

// Things that happen to an account over time (a renewal coming up, a payment failing, a creator publishing).
// The demo page triggers them on demand so each notification can be seen.
export const demoApi = {
  // Moves the plan's renewal to a few days from now, which sends the renewal reminder.
  renewalSoon: () =>
    call(() => {
      const account = signedInAccount();
      if (!account.subscription) throw new ApiError('noActivePlan');
      const endsAt = new Date(Date.now() + (renewalReminderDays - 4) * dayMs);
      const startedAt = new Date(endsAt);
      startedAt.setMonth(startedAt.getMonth() - account.subscription.duration);
      const subscription = { ...account.subscription, startedAt: startedAt.toISOString(), endsAt: endsAt.toISOString(), autoRenew: true, canceledAt: undefined };
      return toSessionAccount(saveAccount(withDueReminders({ ...account, subscription })));
    }),

  // A renewal payment that failed.
  paymentFailed: () =>
    call(() => toSessionAccount(saveAccount(withAlert(signedInAccount(), 'paymentFailed', { method: 'card' }, accountPath('billing'))))),

  // Removes an item from the library. Everyone who licensed it is told; their licenses stay valid.
  removeItem: (itemId: string) =>
    call(() => {
      const item = mockItems.find((candidate) => candidate.id === itemId);
      if (!item) throw new ApiError('itemRemoved');
      const events = readCatalogEvents();
      writeCatalogEvents({ ...events, removedItemIds: { ...events.removedItemIds, [itemId]: new Date().toISOString() } });
      writeAccounts(
        readAccounts().map((account) =>
          account.downloads.some((download) => download.itemId === itemId)
            ? withAlert(account, 'itemRemoved', { title: originalTitle(item) }, routes.downloads)
            : account,
        ),
      );
      return toSessionAccount(signedInAccount());
    }),

  // Revokes the user's newest license, with a reason.
  revokeLatestLicense: (reason: RevokeReason) =>
    call(() => {
      const account = signedInAccount();
      const licenses = readLicenses();
      const latest = licenses.find((license) => license.ownerId === account.id && !license.revoked);
      if (!latest) throw new ApiError('noDownloadAccess');
      writeLicenses(licenses.map((license) => (license.code === latest.code ? { ...license, revoked: { reason, at: new Date().toISOString() } } : license)));
      return toSessionAccount(
        saveAccount(withAlert(account, 'licenseRevoked', { title: latest.itemTitle, code: latest.code, reason }, licenseCheckPath(latest.code))),
      );
    }),

  // A creator publishes a new item: everyone who follows them is told.
  creatorPublishes: (creatorId: string) =>
    call(() => {
      const item = mockItems.find((candidate) => candidate.creator.id === creatorId);
      if (!item) throw new ApiError('collectionNotFound');
      const events = readCatalogEvents();
      writeCatalogEvents({ ...events, publishedAt: { ...events.publishedAt, [item.id]: new Date().toISOString() } });
      writeAccounts(
        readAccounts().map((account) =>
          account.following.includes(creatorId)
            ? withAlert(account, 'creatorPublished', { creator: item.creator.name, title: originalTitle(item) }, itemPath(item.id))
            : account,
        ),
      );
      return toSessionAccount(signedInAccount());
    }),

  // Someone accepts the team's oldest invitation (an account is made for them), so the team can be tried out alone.
  teammateJoins: () =>
    call(() => {
      const account = signedInAccount();
      const team = teamOf(account.id);
      const invite = team?.invites[0];
      if (!team || !invite) throw new ApiError('inviteNotFound');
      const teammate = findByEmail(invite.email) ?? saveAccount(newAccount({ name: invite.email.split('@')[0], email: invite.email, emailVerified: true, passwordHash: null, linkedProviders: [] }, 'en'));
      saveTeam({
        ...team,
        members: [...team.members, { accountId: teammate.id, name: teammate.name, email: teammate.email, role: invite.role, joinedAt: new Date().toISOString() }],
        invites: team.invites.filter((candidate) => candidate.id !== invite.id),
      });
      return toSessionAccount(signedInAccount());
    }),

  // Suspends the account with a reason (the user is told why and can appeal), or lifts the suspension.
  suspend: (reason: SuspensionReason) =>
    call(() => toSessionAccount(saveAccount({ ...signedInAccount(), suspension: { reason, at: new Date().toISOString(), appeal: null } }))),

  liftSuspension: () => call(() => toSessionAccount(saveAccount({ ...signedInAccount(), suspension: null }))),

  // Puts removed and published items back the way they were.
  resetCatalog: () =>
    call(() => {
      writeCatalogEvents({ removedItemIds: {}, publishedAt: {} });
    }),
};
