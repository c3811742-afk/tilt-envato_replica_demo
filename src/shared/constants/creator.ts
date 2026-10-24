// Becoming a creator: the application's review stages, accepted formats and limits.

// Where an application is after it's sent, in order.
export const creatorApplicationStages = ['submitted', 'inReview', 'identityCheck', 'approved'] as const;
export type CreatorApplicationStage = (typeof creatorApplicationStages)[number];

// Banks creators can be paid to (the last one covers any other Egyptian bank).
export const egyptianBanks = ['nbe', 'banqueMisr', 'cib', 'qnb', 'aaib', 'hsbc', 'alexbank', 'other'] as const;
export type EgyptianBank = (typeof egyptianBanks)[number];

export const creatorApplication = {
  aboutMinLength: 30,
  bioMaxLength: 300,
  demoSecondsPerStage: 20, // demo: the application moves to the next stage this often
  samplesAccept: '.pdf,.zip',
  idAccept: 'image/jpeg,image/png,application/pdf',
  avatarAccept: 'image/jpeg,image/png',
  patterns: {
    nationalId: /^\d{14}$/,
    passport: /^[A-Z0-9]{6,9}$/i,
    iban: /^EG\d{27}$/,
    vodafoneCash: /^010\d{8}$/,
    instapay: /^[a-z0-9._-]+@instapay$/,
    taxNumber: /^\d{9}$/,
    username: /^[a-z0-9_]{3,20}$/,
    url: /^https?:\/\/\S+\.\S+$/i,
  },
} as const;
