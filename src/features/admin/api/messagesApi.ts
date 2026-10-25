import { audienceSizes, newsletterSubscribers } from '@/features/admin/mocks';
import type { Announcement, AnnouncementInput, Audience, NewsletterInput, NewsletterOverview } from '@/features/admin/types';
import { storageKeys } from '@/shared/constants';
import { announcementStore, isApprovedCreator, readAccounts, readList, withDueAnnouncements, writeAccounts } from '@/shared/utils';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, newId, now, respond } from './mockServer';

// The demo's audiences, plus the people who signed up on the site in this browser (and its approved creators).
const reach = (): Record<Audience, number> => {
  const accounts = readAccounts();
  const creators = accounts.filter((account) => isApprovedCreator(account.id)).length;
  return {
    customers: audienceSizes.customers + accounts.length,
    creators: audienceSizes.creators + creators,
    everyone: audienceSizes.everyone + accounts.length,
  };
};

// Announcements sent from this admin are saved where the site reads them: each account in the audience gets it in
// its notifications once its time has come (the email is the demo's pretend part). The demo's own are listed after.
const allAnnouncements = () => [...announcementStore.get(), ...db.announcements];

const saveAnnouncement = (saved: Announcement) =>
  announcementStore.set(announcementStore.get().map((current) => (current.id === saved.id ? saved : current)));

// The demo's subscribers, plus the email addresses signed up from the site's newsletter form.
const subscriberCount = () => newsletterSubscribers + readList<string>(storageKeys.newsletter).length;

const messageTarget = (id: string, label: string) => ({ kind: 'message' as const, id, label });

// Scheduled announcements whose time has come count as sent (the site delivers them to each account when it's due).
const markDue = () => {
  const current = now();
  announcementStore.get().forEach((announcement) => {
    if (announcement.status === 'scheduled' && announcement.sendAt <= current) saveAnnouncement({ ...announcement, status: 'sent' });
  });
  db.announcements.forEach((announcement) => {
    if (announcement.status === 'scheduled' && announcement.sendAt <= current) announcement.status = 'sent';
  });
};

// How many people each audience reaches, shown before sending.
export const fetchAudienceSizes = () => respond(reach);

// Newest first.
export const fetchAnnouncements = () =>
  respond(() => {
    markDue();
    return allAnnouncements().sort((a, b) => b.sendAt.localeCompare(a.sendAt));
  });

// Sends now, or schedules it when sendAt is in the future. The accounts in its audience see it in their notifications; no email is sent.
export const sendAnnouncement = (actorId: string, input: AnnouncementInput) =>
  respond((): Announcement => {
    const actor = authorize(actorId, 'sendMessages');
    const sendAt = input.sendAt ?? now();
    const scheduled = sendAt > now();
    const announcement: Announcement = {
      id: newId(),
      audience: input.audience,
      title: input.title.trim(),
      body: input.body.trim(),
      status: scheduled ? 'scheduled' : 'sent',
      sendAt,
      recipients: reach()[input.audience],
      sentBy: actor.name,
    };
    announcementStore.set([...announcementStore.get(), announcement]);
    // Sent now: it goes into the notifications of everyone in the audience right away (scheduled ones arrive when due).
    if (!scheduled) writeAccounts(readAccounts().map((account) => withDueAnnouncements(account)));
    logAction(actor, scheduled ? 'messageScheduled' : 'messageSent', messageTarget(announcement.id, announcement.title), {
      area: 'announcements',
      recipients: announcement.recipients,
    });
    return announcement;
  });

export const cancelAnnouncement = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'sendMessages');
    markDue();
    const found = findById(allAnnouncements(), id);
    if (found.status !== 'scheduled') throw new AdminApiError('notScheduled');

    const announcement: Announcement = { ...found, status: 'canceled' };
    if (announcementStore.get().some((current) => current.id === id)) saveAnnouncement(announcement);
    else db.announcements = db.announcements.map((current) => (current.id === id ? announcement : current));
    logAction(actor, 'messageCanceled', messageTarget(announcement.id, announcement.title), { area: 'announcements' });
    return announcement;
  });

export const fetchNewsletters = () =>
  respond(
    (): NewsletterOverview => ({
      subscribers: subscriberCount(),
      sent: [...db.newsletters].sort((a, b) => b.sentAt.localeCompare(a.sentAt)),
    }),
  );

// Demo: nothing is really sent. It's recorded with the number of subscribers it would reach.
export const sendNewsletter = (actorId: string, input: NewsletterInput) =>
  respond(() => {
    const actor = authorize(actorId, 'sendMessages');
    const newsletter = {
      id: newId(),
      subject: input.subject.trim(),
      body: input.body.trim(),
      sentAt: now(),
      recipients: subscriberCount(),
      sentBy: actor.name,
    };
    db.newsletters.push(newsletter);
    logAction(actor, 'messageSent', messageTarget(newsletter.id, newsletter.subject), {
      area: 'newsletters',
      recipients: newsletter.recipients,
    });
    return newsletter;
  });
