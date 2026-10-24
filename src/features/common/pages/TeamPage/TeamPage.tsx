import { useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  EmailField,
  EmptyState,
  FieldMessage,
  IconNote,
  Meter,
  Modal,
  Page,
  Section,
  Select,
  Stack,
  Text,
  TextField,
} from '@/shared/components';
import { myCollectionsPath, planChangePath, routes } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { InviteRole, PlanId, TeamInvitation, TeamMember, TeamSession } from '@/shared/types';
import { fillText, formatDate, formatNumber, safeAsync, seatsInUse, teamApi, validateEmail, type SessionAccount } from '@/shared/utils';
import { TeamLicenses } from './TeamLicenses';

const inviteRoles: InviteRole[] = ['member', 'admin'];

// Runs a team request, keeps the session in sync and explains a failure.
const useTeamAction = () => {
  const { setAccount } = useSession();
  const { requestError } = useMessages();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const run = async (request: () => Promise<SessionAccount>) => {
    setBusy(true);
    const result = await safeAsync(request);
    setBusy(false);
    setError(result.ok ? undefined : requestError(result.error));
    if (result.ok) setAccount(result.data);
    return result.ok;
  };
  return { busy, error, setError, run };
};

// "Team": invitations to answer, or the team itself: seats, members and their roles, invites, licenses and collections.
export const TeamPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  if (session.status !== 'signedIn') return null; // only signed-in users reach this page

  return (
    <Page title={text.team.title} subtitle={text.team.subtitle} gap={vars.spacing[7]}>
      {session.invitations.length > 0 && <Invitations invitations={session.invitations} />}
      {session.team ? (
        <TeamView team={session.team} myId={session.user.id} planId={session.subscription?.planId} />
      ) : (
        <EmptyState title={text.team.noTeamTitle} message={text.team.noTeamText} action={<Button to={routes.pricing}>{text.common.viewPlans}</Button>} />
      )}
    </Page>
  );
};

const Invitations = ({ invitations }: { invitations: TeamInvitation[] }) => {
  const { text } = useLocale();
  const { busy, error, run } = useTeamAction();
  return (
    <Section title={text.team.invitationsTitle} variant="h3" gap={vars.spacing[3]}>
      {invitations.map((invitation) => (
        <Card key={invitation.inviteId} gap={vars.spacing[3]}>
          <Text autoDirection>
            {fillText(text.team.invitedBy, { name: invitation.invitedBy, team: invitation.teamName, role: text.team.roles[invitation.role] })}
          </Text>
          <Stack direction="row" wrap gap={vars.spacing[2]}>
            <Button disabled={busy} onClick={() => void run(() => teamApi.acceptInvite(invitation.teamId))}>
              {text.team.accept}
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => void run(() => teamApi.declineInvite(invitation.teamId))}>
              {text.team.decline}
            </Button>
          </Stack>
        </Card>
      ))}
      <FieldMessage tone="error" message={error} />
    </Section>
  );
};

const TeamView = ({ team, myId, planId }: { team: TeamSession; myId: string; planId?: PlanId }) => {
  const { text, locale } = useLocale();
  const isOwner = team.role === 'owner';
  const canManage = team.role !== 'member';
  const used = seatsInUse(team);
  const [leaving, setLeaving] = useState(false);

  return (
    <Stack gap={vars.spacing[7]}>
      <Card gap={vars.spacing[4]}>
        {isOwner ? <TeamName name={team.name} /> : <Text variant="h3" autoDirection>{team.name}</Text>}
        <Meter
          label={text.checkout.members}
          value={used}
          max={team.seats}
          valueText={fillText(text.team.seatsUsed, { used: formatNumber(used, locale), seats: formatNumber(team.seats, locale) })}
        />
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {isOwner ? text.team.ownerBillingNote : fillText(text.team.billingNote, { owner: team.ownerName })}
        </Text>
        <Stack direction="row" wrap gap={vars.spacing[2]}>
          {isOwner && planId && (
            <Button variant="outline" size="sm" to={planChangePath(planId)}>
              {text.team.addSeats}
            </Button>
          )}
          <Button variant="outline" size="sm" to={myCollectionsPath('team')}>
            {text.team.viewCollections}
          </Button>
          {!isOwner && (
            <Button variant="outline" size="sm" onClick={() => setLeaving(true)}>
              {text.team.leave}
            </Button>
          )}
        </Stack>
      </Card>

      <Members team={team} myId={myId} />
      {canManage && <InviteForm isOwner={isOwner} full={used >= team.seats} />}
      {canManage && <PendingInvites team={team} />}
      <TeamLicenses showDownloader={canManage} />

      {leaving && <LeaveDialog teamName={team.name} onClose={() => setLeaving(false)} />}
    </Stack>
  );
};

// The owner renames the team.
const TeamName = ({ name }: { name: string }) => {
  const { text } = useLocale();
  const { busy, error, setError, run } = useTeamAction();
  const [value, setValue] = useState(name);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) {
      setError(text.validation.required);
      return;
    }
    void run(() => teamApi.rename(value));
  };
  return (
    <Stack as="form" direction="row" wrap align="flex-end" gap={vars.spacing[3]} onSubmit={submit} noValidate>
      <Stack grow>
        <TextField label={text.team.name} value={value} onChange={setValue} error={error} />
      </Stack>
      <Button type="submit" variant="outline" disabled={busy || value.trim() === name}>
        {text.common.saveChanges}
      </Button>
    </Stack>
  );
};

const Members = ({ team, myId }: { team: TeamSession; myId: string }) => {
  const { text, locale } = useLocale();
  const { busy, error, run } = useTeamAction();
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  // Admins can remove members; the owner can also manage admins.
  const canRemove = (member: TeamMember) =>
    member.accountId !== myId && member.role !== 'owner' && (team.role === 'owner' || (team.role === 'admin' && member.role === 'member'));

  return (
    <Section title={text.team.membersTitle} subtitle={text.team.adminNote} variant="h3" gap={vars.spacing[3]}>
      <Stack as="ul" gap={vars.spacing[2]}>
        {team.members.map((member) => (
          <Card key={member.accountId} as="li" padding={vars.spacing[4]} gap={vars.spacing[2]}>
            <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
              <Stack gap={vars.spacing[1]}>
                <Text variant="title" autoDirection>
                  {member.accountId === myId ? `${member.name} (${text.team.you})` : member.name}
                </Text>
                <Text variant="bodySm" color={vars.colors.textMuted}>
                  <bdi>{member.email}</bdi> · {fillText(text.team.joinedOn, { date: formatDate(member.joinedAt, locale) })}
                </Text>
              </Stack>
              <Badge variant={member.role === 'member' ? 'neutral' : 'info'}>{text.team.roles[member.role]}</Badge>
            </Stack>
            {(team.role === 'owner' && member.role !== 'owner') || canRemove(member) ? (
              <Stack direction="row" wrap gap={vars.spacing[2]}>
                {team.role === 'owner' && member.role !== 'owner' && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void run(() => teamApi.setRole(member.accountId, member.role === 'admin' ? 'member' : 'admin'))}
                  >
                    {member.role === 'admin' ? text.team.removeAdmin : text.team.makeAdmin}
                  </Button>
                )}
                {canRemove(member) && (
                  <Button variant="outline" size="sm" onClick={() => setRemoving(member)}>
                    {text.team.remove}
                  </Button>
                )}
              </Stack>
            ) : null}
          </Card>
        ))}
      </Stack>
      <FieldMessage tone="error" message={error} />
      {removing && (
        <Modal
          open
          onClose={() => setRemoving(null)}
          title={fillText(text.team.removeTitle, { name: removing.name })}
          actions={
            <>
              <Button variant="outline" onClick={() => setRemoving(null)}>
                {text.common.cancel}
              </Button>
              <Button variant="danger" disabled={busy} onClick={() => void run(() => teamApi.removeMember(removing.accountId)).then((ok) => ok && setRemoving(null))}>
                {text.team.remove}
              </Button>
            </>
          }
        >
          <Text>{text.team.removeText}</Text>
          <FieldMessage tone="error" message={error} />
        </Modal>
      )}
    </Section>
  );
};

const InviteForm = ({ isOwner, full }: { isOwner: boolean; full: boolean }) => {
  const { text } = useLocale();
  const { fieldError } = useMessages();
  const { busy, error, setError, run } = useTeamAction();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('member');
  const [sentTo, setSentTo] = useState<string>();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const invalid = validateEmail(email);
    if (invalid) {
      setError(fieldError(invalid));
      return;
    }
    if (await run(() => teamApi.invite({ email, role }))) {
      setSentTo(email.trim());
      setEmail('');
    }
  };

  return (
    <Section title={text.team.inviteTitle} variant="h3" gap={vars.spacing[3]}>
      {full && <IconNote text={text.apiErrors.noSeatsLeft} />}
      <Stack as="form" gap={vars.spacing[3]} onSubmit={submit} noValidate>
        <EmailField label={text.team.inviteEmail} value={email} onChange={setEmail} error={error} />
        {/* Only the owner can give admin seats. */}
        {isOwner && (
          <Select
            label={text.team.inviteRole}
            value={role}
            onChange={(value) => setRole(value as InviteRole)}
            options={inviteRoles.map((option) => ({ value: option, label: text.team.roles[option] }))}
          />
        )}
        {sentTo && <IconNote icon="check" text={fillText(text.team.invited, { email: sentTo })} />}
        <div>
          <Button type="submit" disabled={busy || full}>
            {text.team.invite}
          </Button>
        </div>
      </Stack>
    </Section>
  );
};

const PendingInvites = ({ team }: { team: TeamSession }) => {
  const { text, locale } = useLocale();
  const { busy, error, run } = useTeamAction();
  return (
    <Section title={text.team.pendingTitle} variant="h3" gap={vars.spacing[3]}>
      {team.invites.length === 0 ? (
        <Text color={vars.colors.textMuted}>{text.team.pendingEmpty}</Text>
      ) : (
        <Stack as="ul" gap={vars.spacing[2]}>
          {team.invites.map((invite) => (
            <Card key={invite.id} as="li" padding={vars.spacing[4]}>
              <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
                <Stack gap={vars.spacing[1]}>
                  <Text variant="title">
                    <bdi>{invite.email}</bdi> · {text.team.roles[invite.role]}
                  </Text>
                  <Text variant="bodySm" color={vars.colors.textMuted}>
                    {fillText(text.team.invitedOn, { name: invite.invitedBy, date: formatDate(invite.invitedAt, locale) })}
                  </Text>
                </Stack>
                <Button variant="outline" size="sm" disabled={busy} onClick={() => void run(() => teamApi.cancelInvite(invite.id))}>
                  {text.team.cancelInvite}
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
      <FieldMessage tone="error" message={error} />
    </Section>
  );
};

const LeaveDialog = ({ teamName, onClose }: { teamName: string; onClose: () => void }) => {
  const { text } = useLocale();
  const { busy, error, run } = useTeamAction();
  return (
    <Modal
      open
      onClose={onClose}
      title={fillText(text.team.leaveTitle, { team: teamName })}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button variant="danger" disabled={busy} onClick={() => void run(teamApi.leave).then((ok) => ok && onClose())}>
            {text.team.leave}
          </Button>
        </>
      }
    >
      <Text>{text.team.leaveText}</Text>
      <FieldMessage tone="error" message={error} />
    </Modal>
  );
};
