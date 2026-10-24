export type Audience = 'customers' | 'creators' | 'everyone';
export type MessageStatus = 'scheduled' | 'sent' | 'canceled';

// A message shown on the site and sent by email to customers, creators or both.
export interface Announcement {
  id: string;
  audience: Audience;
  title: string;
  body: string;
  status: MessageStatus;
  sendAt: string;
  recipients: number;
  sentBy: string;
}

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
