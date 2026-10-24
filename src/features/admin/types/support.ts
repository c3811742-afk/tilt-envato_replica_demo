export type RequesterKind = 'customer' | 'creator';
export type TicketTopic = 'billing' | 'downloads' | 'licenses' | 'account' | 'payouts' | 'review';
export type TicketStatus = 'open' | 'answered' | 'closed';

export interface TicketMessage {
  id: string;
  fromSupport: boolean;
  authorName: string;
  body: string;
  at: string;
}

export interface Ticket {
  id: string;
  subject: string;
  requester: { name: string; email: string; kind: RequesterKind };
  topic: TicketTopic;
  status: TicketStatus; // open: waiting for support. answered: waiting for the customer or creator.
  updatedAt: string;
  messages: TicketMessage[];
}

export type ItemReportKind = 'brokenFiles' | 'infringement' | 'wrongCategory' | 'offensive';
export type ItemReportStatus = 'open' | 'fixed' | 'removed' | 'dismissed';
export type ItemReportResolution = Exclude<ItemReportStatus, 'open'>;

// A customer reported a problem with a live element.
export interface ItemReport {
  id: string;
  element: { id: string; title: string };
  kind: ItemReportKind;
  reporter: string;
  note: string;
  reportedAt: string;
  status: ItemReportStatus;
}
