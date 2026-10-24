import { audienceSizes, newsletterSubscribers } from '@/features/admin/mocks';
import type { Announcement, AnnouncementInput, NewsletterInput, NewsletterOverview } from '@/features/admin/types';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, newId, now, respond } from './mockServer';

const messageTarget = (id: string, label: string) => ({ kind: 'message' as const, id, label });

// Scheduled announcements whose time has come count as sent (the demo has no real sending queue).
const markDue = () => {
  const current = now();
  db.announcements.forEach((announcement) => {
    if (announcement.status === 'scheduled' && announcement.sendAt <= current) announcement.status = 'sent';
  });
};

// How many people each audience reaches, shown before sending.
export const fetchAudienceSizes = () => respond(() => audienceSizes);

// Newest first.
export const fetchAnnouncements = () =>
  respond(() => {
    markDue();
    return [...db.announcements].sort((a, b) => b.sendAt.localeCompare(a.sendAt));
  });

// Sends now, or schedules it when sendAt is in the future. Demo: nothing is really sent.
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
      recipients: audienceSizes[input.audience],
      sentBy: actor.name,
    };
    db.announcements.push(announcement);
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
      subscribers: newsletterSubscribers,
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
      recipients: newsletterSubscribers,
      sentBy: actor.name,
    };
    db.newsletters.push(newsletter);
    logAction(actor, 'messageSent', messageTarget(newsletter.id, newsletter.subject), {
      area: 'newsletters',
      recipients: newsletter.recipients,
    });
    return newsletter;
  });
