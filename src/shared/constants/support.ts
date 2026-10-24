// What a support request is about (the contact form's first question).
export const supportTopics = ['account', 'billing', 'downloads', 'licensing', 'ai', 'other'] as const;
export type SupportTopic = (typeof supportTopics)[number];

// Who is reporting a copyright infringement.
export const copyrightRoles = ['owner', 'agent'] as const;
export type CopyrightRole = (typeof copyrightRoles)[number];

// Why an account can be suspended (shown to the user, who can appeal).
export const suspensionReasons = ['termsBreach', 'licenseMisuse', 'paymentFraud'] as const;
export type SuspensionReason = (typeof suspensionReasons)[number];

// Help Center and Learn guides are grouped by these topics.
export const helpTopics = ['licensing', 'collections', 'search', 'ai'] as const;
export type HelpTopic = (typeof helpTopics)[number];

export const supportLimits = {
  subjectMaxLength: 120,
  messageMaxLength: 2000,
  messageMinLength: 20, // enough for the team to understand the problem
} as const;

// Reference numbers given to the user: "SUP-482913", "CR-104822".
export const referencePrefixes = {
  support: 'SUP',
  copyright: 'CR',
} as const;
