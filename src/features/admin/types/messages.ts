import type { AnnouncementAudience, SiteAnnouncement } from '@/shared/types';

export type Audience = AnnouncementAudience;
export type MessageStatus = SiteAnnouncement['status'];

// A message shown on the site and sent by email to customers, creators or both.
export type Announcement = SiteAnnouncement;

export interface AnnouncementInput {
  audience: Audience;
  title: string;
  body: string;
  sendAt: string | null; // null sends it now
}

export interface Newsletter {
  id: string;
  subject: string;
  body: string;
  sentAt: string;
  recipients: number;
  sentBy: string;
}

export type NewsletterInput = Pick<Newsletter, 'subject' | 'body'>;

export interface NewsletterOverview {
  subscribers: number;
  sent: Newsletter[];
}
