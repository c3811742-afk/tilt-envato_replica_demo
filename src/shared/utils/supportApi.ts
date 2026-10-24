import { referencePrefixes, type CopyrightRole, type SupportTopic } from '@/shared/constants';
import { call, randomDigits, updateSignedIn } from './accountStore';
import { ApiError } from './apiError';

const referenceLength = 6;
const reference = (prefix: string) => `${prefix}-${randomDigits(referenceLength)}`;

// Support: requests to the support team, copyright reports, and appeals against a suspension.
// The demo keeps them on the account; nothing is sent anywhere.
export const supportApi = {
  contact: ({ topic, subject, message }: { topic: SupportTopic; subject: string; message: string }) =>
    call(() =>
      updateSignedIn((account) => ({
        supportRequests: [
          {
            id: crypto.randomUUID(),
            reference: reference(referencePrefixes.support),
            topic,
            subject: subject.trim(),
            message: message.trim(),
            createdAt: new Date().toISOString(),
            status: 'open' as const,
          },
          ...account.supportRequests,
        ],
      })),
    ),

  reportCopyright: (report: { itemId: string; itemTitle: string; name: string; email: string; role: CopyrightRole; details: string }) =>
    call(() =>
      updateSignedIn((account) => ({
        copyrightReports: [
          { ...report, id: crypto.randomUUID(), reference: reference(referencePrefixes.copyright), details: report.details.trim(), createdAt: new Date().toISOString() },
          ...account.copyrightReports,
        ],
      })),
    ),

  // Asks the team to look at a suspension again.
  appeal: (message: string) =>
    call(() =>
      updateSignedIn((account) => {
        if (!account.suspension) throw new ApiError('nothingToConfirm');
        return { suspension: { ...account.suspension, appeal: { message: message.trim(), at: new Date().toISOString() } } };
      }),
    ),
};
