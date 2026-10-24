import { downloadAlertRule } from '@/features/admin/constants';
import type {
  AccountStatus,
  AdminAlerts,
  Admin,
  AppealOutcome,
  ApplicationRejectReason,
  CreatorApplication,
  DecisionInput,
  DownloadAlert,
  IdentityCheck,
  IdRejectReason,
  StatusAction,
  StatusInput,
  UserAccount,
  UserDetails,
  UserDownload,
  UserLicense,
} from '@/features/admin/types';
import { storageKeys, texts } from '@/shared/constants';
import type { Suspension } from '@/shared/types';
import {
  readAccounts,
  readLicenses,
  readList,
  saveAccount,
  storage,
  type AuthorApplication,
  type PartnerApplication,
  type StoredAccount,
} from '@/shared/utils';
import { AdminApiError } from './errors';
import { allTickets } from './supportApi';
import { authorize, db, findById, logAction, now, respond } from './mockServer';

// ---------- Accounts from the customer side ----------
// People who signed up on the site in this browser. Their accounts live in the site's own storage,
// so a suspension made here locks them out there, and the appeal they send comes back here.

const siteStatus = (suspension: Suspension | null): AccountStatus => {
  if (!suspension) return 'active';
  return suspension.banned ? 'banned' : 'suspended';
};

const fromSite = (account: StoredAccount): UserAccount => ({
  id: account.id,
  name: account.name,
  email: account.email,
  kind: 'customer',
  source: 'site',
  joinedAt: account.termsAcceptedAt,
  status: siteStatus(account.suspension),
  statusReason: account.suspension?.reason,
  statusAt: account.suspension?.at,
  appeal: account.suspension?.appeal ?? undefined,
  planName: account.subscription ? texts.en.pricing.plans[account.subscription.planId].name : undefined,
});

const siteAccount = (id: string) => readAccounts().find((account) => account.id === id);

const siteDownloads = (account: StoredAccount): UserDownload[] =>
  account.downloads.map((download) => ({
    id: download.id,
    itemTitle: download.itemTitle,
    licenseCode: download.licenseCode,
    at: download.requestedAt,
  }));

export const allUsers = () => [...readAccounts().map(fromSite), ...db.users];

const downloadsOf = (user: UserAccount) => {
  const account = user.source === 'site' ? siteAccount(user.id) : undefined;
  return account ? siteDownloads(account) : (db.userDownloads[user.id] ?? []);
};

const findUser = (id: string) => findById(allUsers(), id);

// Saves a new status (and appeal) on whichever side the account lives.
const saveStatus = (user: UserAccount, changes: Pick<UserAccount, 'status' | 'statusReason' | 'statusAt' | 'appeal'>) => {
  if (user.source === 'site') {
    const account = siteAccount(user.id);
    if (!account) throw new AdminApiError('notFound');
    const suspension: Suspension | null =
      changes.status === 'active' || !changes.statusReason || !changes.statusAt
        ? null
        : {
            reason: changes.statusReason,
            at: changes.statusAt,
            banned: changes.status === 'banned' || undefined,
            appeal: changes.appeal ?? null,
          };
    return fromSite(saveAccount({ ...account, suspension }));
  }
  const saved: UserAccount = { ...user, ...changes };
  db.users = db.users.map((current) => (current.id === user.id ? saved : current));
  return saved;
};

const statusAfter: Record<StatusAction, AccountStatus> = { suspend: 'suspended', ban: 'banned', reactivate: 'active' };

const userTarget = (user: UserAccount) => ({ kind: 'user' as const, id: user.id, label: user.name });

// Newest accounts first. Searching and filtering happen on the page.
export const fetchUsers = () => respond(() => allUsers().sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)));

const byNewest = <T>(list: T[], at: (item: T) => string) => [...list].sort((a, b) => at(b).localeCompare(at(a)));

// One account with its plans, downloads and licenses.
export const fetchUser = (id: string) =>
  respond((): UserDetails => {
    const account = findUser(id);
    const site = account.source === 'site' ? siteAccount(id) : undefined;
    const subscription = site?.subscription;
    const licenses: UserLicense[] = site
      ? readLicenses()
          .filter((license) => license.ownerId === id)
          .map((license) => ({
            code: license.code,
            itemTitle: license.itemTitle,
            project: license.projectName,
            issuedAt: license.issuedAt,
            status: license.revoked ? 'revoked' : 'valid',
          }))
      : db.licenses
          .filter((license) => license.customer.email === account.email)
          .map((license) => ({
            code: license.code,
            itemTitle: license.element.title,
            project: license.project,
            issuedAt: license.issuedAt,
            status: license.status,
          }));

    return {
      account,
      subscriptions: subscription
        ? [
            {
              id: `site-${id}`,
              customer: { id, name: account.name, email: account.email },
              planName: texts.en.pricing.plans[subscription.planId].name,
              period: subscription.duration === 12 ? 'yearly' : 'monthly',
              status: subscription.canceledAt ? 'canceling' : 'active',
              startedAt: subscription.startedAt,
              renewsAt: subscription.endsAt,
            },
          ]
        : db.subscriptions.filter((current) => current.customer.email === account.email),
      downloads: byNewest(downloadsOf(account), (download) => download.at),
      licenses: byNewest(licenses, (license) => license.issuedAt),
    };
  });

// Suspend (can appeal), ban (closed for good) or reactivate an account. Suspending and banning need a reason.
export const changeUserStatus = (actorId: string, id: string, input: StatusInput) =>
  respond(() => {
    const actor = authorize(actorId, 'manageUsers');
    const user = findUser(id);
    const status = statusAfter[input.action];
    if (user.status === status) throw new AdminApiError('sameStatus');
    if (input.action !== 'reactivate' && !input.reason) throw new AdminApiError('notAllowed');

    const saved = saveStatus(
      user,
      status === 'active'
        ? { status, statusReason: undefined, statusAt: undefined, appeal: undefined }
        : { status, statusReason: input.reason, statusAt: now(), appeal: undefined },
    );
    const action = { suspend: 'userSuspended', ban: 'userBanned', reactivate: 'userReactivated' } as const;
    logAction(actor, action[input.action], userTarget(saved), { suspensionReason: input.reason, note: input.note || undefined });
    return saved;
  });

// ---------- Appeals ----------

// Suspended or banned accounts whose appeal is waiting for an answer. Oldest first: they've waited longest.
export const fetchAppeals = () =>
  respond(() =>
    allUsers()
      .filter((user) => user.status !== 'active' && user.appeal && !user.appeal.rejectedAt)
      .sort((a, b) => (a.appeal?.at ?? '').localeCompare(b.appeal?.at ?? '')),
  );

// Accepting reactivates the account. Rejecting keeps it closed, and the user sees that their appeal was rejected.
export const decideAppeal = (actorId: string, id: string, outcome: AppealOutcome, note: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageUsers');
    const user = findUser(id);
    if (!user.appeal || user.appeal.rejectedAt || user.status === 'active') throw new AdminApiError('alreadyDecided');

    const saved =
      outcome === 'accepted'
        ? saveStatus(user, { status: 'active', statusReason: undefined, statusAt: undefined, appeal: undefined })
        : saveStatus(user, { ...user, appeal: { ...user.appeal, rejectedAt: now() } });
    logAction(actor, 'appealDecided', userTarget(saved), {
      change: outcome === 'accepted' ? 'approved' : 'rejected',
      note: note || undefined,
    });
    return saved;
  });

// ---------- Unusual downloads ----------

const hourMs = 60 * 60 * 1000;

const alertFor = (user: UserAccount, downloads: UserDownload[], dismissedAt?: string): DownloadAlert | null => {
  const { windowHours, minimum, timesUsual, historyDays } = downloadAlertRule;
  const windowStart = Date.now() - windowHours * hourMs;
  const historyStart = windowStart - historyDays * 24 * hourMs;
  const counted = (download: UserDownload) => new Date(download.at).getTime();
  // After an admin looks at an alert, only newer downloads count, so it doesn't come straight back.
  const after = Math.max(windowStart, dismissedAt ? new Date(dismissedAt).getTime() : 0);
  const recent = downloads.filter((download) => counted(download) > after).length;
  const earlier = downloads.filter((download) => counted(download) >= historyStart && counted(download) < windowStart).length;
  const usual = Math.max(1, Math.round(earlier / historyDays));
  if (recent < minimum || recent < usual * timesUsual) return null;
  return {
    user: { id: user.id, name: user.name, email: user.email, status: user.status },
    count: recent,
    usual,
    since: new Date(windowStart).toISOString(),
  };
};

const downloadAlerts = () =>
  allUsers()
    .map((user) => alertFor(user, downloadsOf(user), db.dismissedAlerts[user.id]))
    .filter((alert): alert is DownloadAlert => alert !== null)
    .sort((a, b) => b.count - a.count);

// Accounts that downloaded far more than usual in the last day. Checked every time, so it covers site accounts too.
export const fetchDownloadAlerts = () => respond(downloadAlerts);

// "Looks fine": hides the alert until the account downloads unusually much again.
export const dismissDownloadAlert = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageUsers');
    const user = findUser(id);
    db.dismissedAlerts[id] = now();
    logAction(actor, 'downloadAlertDismissed', userTarget(user));
  });

// ---------- Creator applications ----------
// From the admin demo data, and from the "Become an author" form on the site (kept in the site's storage).

type SiteApplication = (AuthorApplication | PartnerApplication) & {
  reference: string;
  at: string;
  status?: CreatorApplication['status'];
  decision?: CreatorApplication['decision'];
};

const readSiteApplications = () => readList<SiteApplication>(storageKeys.applications);

const fromSiteApplication = (application: SiteApplication): CreatorApplication => ({
  id: application.reference,
  program: application.kind,
  name: application.name,
  email: application.email,
  portfolio: application.kind === 'author' ? application.portfolio : application.website,
  message: application.kind === 'author' ? undefined : application.message,
  categories: application.kind === 'author' ? application.categories : [],
  at: application.at,
  source: 'site',
  status: application.status ?? 'pending',
  decision: application.decision,
});

export const allApplications = () => [
  ...readSiteApplications().map(fromSiteApplication),
  ...db.creatorApplications,
];

// Waiting ones first (oldest first), then the decided ones (newest first).
const pendingFirst = <T extends { status: string }>(list: T[], at: (item: T) => string) => [
  ...list.filter((item) => item.status === 'pending').sort((a, b) => at(a).localeCompare(at(b))),
  ...list.filter((item) => item.status !== 'pending').sort((a, b) => at(b).localeCompare(at(a))),
];

export const fetchCreatorApplications = () => respond(() => pendingFirst(allApplications(), (application) => application.at));

const decisionOf = <R extends string>(actor: Admin, input: DecisionInput<R>) => {
  if (!input.approve && !input.reason) throw new AdminApiError('notAllowed');
  return { reason: input.approve ? undefined : input.reason, note: input.note, adminName: actor.name, at: now() };
};

export const decideCreatorApplication = (actorId: string, id: string, input: DecisionInput<ApplicationRejectReason>) =>
  respond(() => {
    const actor = authorize(actorId, 'reviewCreators');
    const application = findById(allApplications(), id);
    if (application.status !== 'pending') throw new AdminApiError('alreadyDecided');
    const saved: CreatorApplication = {
      ...application,
      status: input.approve ? 'approved' : 'rejected',
      decision: decisionOf(actor, input),
    };
    if (application.source === 'site') {
      const list = readSiteApplications().map((current) =>
        current.reference === id ? { ...current, status: saved.status, decision: saved.decision } : current,
      );
      storage.set(storageKeys.applications, JSON.stringify(list));
    } else {
      db.creatorApplications = db.creatorApplications.map((current) => (current.id === id ? saved : current));
    }
    logAction(actor, 'applicationDecided', { kind: 'application', id, label: saved.name }, {
      change: input.approve ? 'approved' : 'rejected',
      applicationReason: saved.decision?.reason,
      note: input.note || undefined,
    });
    return saved;
  });

// ---------- Identity checks ----------

export const fetchIdentityChecks = () =>
  respond(() => pendingFirst(db.identityChecks, (check) => check.submittedAt));

export const decideIdentityCheck = (actorId: string, id: string, input: DecisionInput<IdRejectReason>) =>
  respond((): IdentityCheck => {
    const actor = authorize(actorId, 'reviewCreators');
    const check = findById(db.identityChecks, id);
    if (check.status !== 'pending') throw new AdminApiError('alreadyDecided');
    const saved: IdentityCheck = { ...check, status: input.approve ? 'approved' : 'rejected', decision: decisionOf(actor, input) };
    db.identityChecks = db.identityChecks.map((current) => (current.id === id ? saved : current));
    logAction(actor, 'identityDecided', { kind: 'identityCheck', id, label: check.creator.name }, {
      change: input.approve ? 'approved' : 'rejected',
      idReason: saved.decision?.reason,
      note: input.note || undefined,
    });
    return saved;
  });

// ---------- Top bar alerts ----------

// How many things are waiting for each kind of admin. The top bar shows the ones the signed-in admin can act on.
export const fetchAdminAlerts = () =>
  respond((): AdminAlerts => ({
    reviews: db.elements.filter((element) => element.status === 'pending').length,
    appeals: allUsers().filter((user) => user.status !== 'active' && user.appeal && !user.appeal.rejectedAt).length,
    downloadAlerts: downloadAlerts().length,
    applications: allApplications().filter((application) => application.status === 'pending').length,
    identityChecks: db.identityChecks.filter((check) => check.status === 'pending').length,
    tickets: allTickets().filter((ticket) => ticket.status === 'open').length,
  }));
