import { audienceSizes, newsletterSubscribers } from '@/features/admin/mocks';
import type { Announcement, AnnouncementInput, Audience, NewsletterInput, NewsletterOverview } from '@/features/admin/types';
import { storageKeys } from '@/shared/constants';
import { readAccounts, readList, withAlert, writeAccounts } from '@/shared/utils';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, newId, now, respond } from './mockServer';

// Site accounts are customers: they get announcements for customers and for everyone.
const reachesSite = (audience: Audience) => audience !== 'creators';

// The demo's audiences, plus the customers who signed up on the site in this browser.
const reach = (): Record<Audience, number> => {
  const site = readAccounts().length;
  return { customers: audienceSizes.customers + site, creators: audienceSizes.creators, everyone: audienceSizes.everyone + site };
};

// Shows the announcement in each site customer's notifications (the email is the demo's pretend part).
const deliver = (announcement: Announcement) => {
  if (!reachesSite(announcement.audience)) return;
  writeAccounts(
    readAccounts().map((account) => withAlert(account, 'announcement', { title: announcement.title, message: announcement.body })),
  );
};

// The demo's subscribers, plus the email addresses signed up from the site's newsletter form.
const subscriberCount = () => newsletterSubscribers + readList<string>(storageKeys.newsletter).length;

const messageTarget = (id: string, label: string) => ({ kind: 'message' as const, id, label });

// Scheduled announcements whose time has come count as sent (the demo has no real sending queue).
const markDue = () => {
  const current = now();
  db.announcements.forEach((announcement) => {
    if (announcement.status === 'scheduled' && announcement.sendAt <= current) {
      announcement.status = 'sent';
      deliver(announcement);
    }
  });
};

// How many people each audience reaches, shown before sending.
export const fetchAudienceSizes = () => respond(reach);

// Newest first.
export const fetchAnnouncements = () =>
  respond(() => {
    markDue();
    return [...db.announcements].sort((a, b) => b.sendAt.localeCompare(a.sendAt));
  });

// Sends now, or schedules it when sendAt is in the future. Site customers see it in their notifications; no email is sent.
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
    db.announcements.push(announcement);
    if (!scheduled) deliver(announcement);
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
    const announcement = findById(db.announcements, id);
    if (announcement.status !== 'scheduled') throw new AdminApiError('notScheduled');

    announcement.status = 'canceled';
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
