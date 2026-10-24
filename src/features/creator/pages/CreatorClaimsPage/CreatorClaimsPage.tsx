import { useState } from 'react';
import { AsyncContent, Button, Card, EmptyState, Stack, Text, TextField } from '@/shared/components';
import { routes, studioLimits } from '@/shared/constants';
import { useAction, useAsync, useLocale, useMessages } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { StudioClaim } from '@/shared/types';
import { fillText, formatDate, studioApi, validateMessage } from '@/shared/utils';
import { CreatorArea } from '@/features/creator/components';

// "Copyright claims": claims customers made against the creator's elements, and the creator's reply.
export const CreatorClaimsPage = () => {
  const { text } = useLocale();
  const claims = useAsync(studioApi.claims, []);
  const t = text.studio;

  return (
    <CreatorArea section="claims" title={t.claimsTitle} subtitle={t.claimsSubtitle}>
      <AsyncContent
        state={claims}
        empty={<EmptyState title={t.claimsTitle} message={t.claimsEmpty} />}
      >
        {(data) => (
          <Stack as="ul" gap={vars.spacing[3]}>
            {data.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} onReplied={claims.retry} />
            ))}
          </Stack>
        )}
      </AsyncContent>
      <div>
        <Button variant="outline" to={routes.support}>
          {t.contactSupport}
        </Button>
      </div>
    </CreatorArea>
  );
};

const ClaimCard = ({ claim, onReplied }: { claim: StudioClaim; onReplied: () => void }) => {
  const { text, locale } = useLocale();
  const { fieldError } = useMessages();
  const { run, busy, error, setError } = useAction();
  const [message, setMessage] = useState('');
  const t = text.studio;

  const reply = async () => {
    const invalid = validateMessage(message);
    if (invalid) {
      setError(fieldError(invalid));
      return;
    }
    const result = await run(() => studioApi.respondToClaim(claim.id, message));
    if (result.ok) onReplied();
  };

  return (
    <Card as="li" gap={vars.spacing[3]}>
      <Stack gap={vars.spacing[1]}>
        <Text variant="title" autoDirection>
          {claim.elementTitle}
        </Text>
        <Text variant="bodySm" color={vars.colors.textMuted}>
          <bdi>{claim.reference}</bdi> · {fillText(t.claimBy, { name: claim.claimant, date: formatDate(claim.createdAt, locale) })}
        </Text>
      </Stack>
      <Text autoDirection>{claim.details}</Text>
      {claim.response ? (
        <Stack gap={vars.spacing[1]}>
          <Text variant="label" color={vars.colors.textMuted}>
            {fillText(t.responseSent, { date: formatDate(claim.response.at, locale) })}
          </Text>
          <Text autoDirection>{claim.response.message}</Text>
        </Stack>
      ) : (
        <Stack gap={vars.spacing[2]}>
          <TextField label={t.response} value={message} onChange={setMessage} rows={3} maxLength={studioLimits.descriptionMaxLength} error={error} />
          <div>
            <Button disabled={busy} onClick={() => void reply()}>
              {t.sendResponse}
            </Button>
          </div>
        </Stack>
      )}
    </Card>
  );
};
