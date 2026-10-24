import { routes } from '@/shared/constants';
import type { InviteRole, Team, TeamMember } from '@/shared/types';
import {
  call,
  findByEmail,
  findById,
  normalizeEmail,
  readLicenses,
  readTeams,
  saveAccount,
  saveTeam,
  signedInAccount,
  teamOf,
  toSessionAccount,
  withAlert,
  writeTeams,
  type StoredAccount,
} from './accountStore';
import { ApiError } from './apiError';

// Teams: the owner pays and manages admins; owners and admins invite and remove members.
// Every invite holds a seat until it is answered or cancelled.

const memberFor = (account: StoredAccount, role: TeamMember['role']): TeamMember => ({
  accountId: account.id,
  name: account.name,
  email: account.email,
  role,
  joinedAt: new Date().toISOString(),
});

// The owner's team, created the first time they buy a plan with seats.
export const ensureTeam = (owner: StoredAccount) =>
  teamOf(owner.id) ??
  saveTeam({
    id: crypto.randomUUID(),
    name: owner.profile?.fullName ?? owner.name,
    ownerId: owner.id,
    members: [memberFor(owner, 'owner')],
    invites: [],
    collections: [],
  });

// Seats the team uses: its members and the invites still waiting.
export const seatsInUse = (team: Team) => team.members.length + team.invites.length;

const seatsOf = (team: Team) => findById(team.ownerId)?.subscription?.members ?? team.members.length;

// The signed-in user's team and their role in it. Admin actions need owner or admin; some need the owner.
const myTeam = (needs: 'member' | 'admin' | 'owner' = 'member') => {
  const account = signedInAccount();
  const team = teamOf(account.id);
  if (!team) throw new ApiError('notInTeam');
  const role = team.members.find((member) => member.accountId === account.id)?.role ?? 'member';
  if (needs === 'owner' && role !== 'owner') throw new ApiError('teamOwnerOnly');
  if (needs === 'admin' && role === 'member') throw new ApiError('teamOwnerOnly');
  return { account, team, role };
};

const session = () => toSessionAccount(signedInAccount());

export const teamApi = {
  rename: (name: string) =>
    call(() => {
      const { team } = myTeam('owner');
      saveTeam({ ...team, name: name.trim() });
      return session();
    }),

  // Invites someone by email. Only the owner can give an admin seat.
  invite: ({ email, role }: { email: string; role: InviteRole }) =>
    call(() => {
      const { account, team, role: myRole } = myTeam('admin');
      if (role === 'admin' && myRole !== 'owner') throw new ApiError('teamOwnerOnly');
      const address = normalizeEmail(email);
      if (team.members.some((member) => member.email === address)) throw new ApiError('alreadyInTeam');
      if (team.invites.some((invite) => invite.email === address)) throw new ApiError('alreadyInvited');
      if (seatsInUse(team) >= seatsOf(team)) throw new ApiError('noSeatsLeft');
      saveTeam({
        ...team,
        invites: [...team.invites, { id: crypto.randomUUID(), email: address, role, invitedAt: new Date().toISOString(), invitedBy: account.name }],
      });
      // Someone who already has an account is told right away; anyone else sees it when they sign up.
      const invitee = findByEmail(address);
      if (invitee) saveAccount(withAlert(invitee, 'teamInvite', { team: team.name, name: account.name }, routes.team));
      return session();
    }),

  cancelInvite: (inviteId: string) =>
    call(() => {
      const { team } = myTeam('admin');
      saveTeam({ ...team, invites: team.invites.filter((invite) => invite.id !== inviteId) });
      return session();
    }),

  // Gives a member an admin seat, or takes it back (the owner only).
  setRole: (accountId: string, role: InviteRole) =>
    call(() => {
      const { team } = myTeam('owner');
      if (accountId === team.ownerId) throw new ApiError('teamOwnerOnly');
      saveTeam({ ...team, members: team.members.map((member) => (member.accountId === accountId ? { ...member, role } : member)) });
      return session();
    }),

  // Removes a member. Admins can remove members; only the owner can remove an admin.
  removeMember: (accountId: string) =>
    call(() => {
      const { team, role } = myTeam('admin');
      const target = team.members.find((member) => member.accountId === accountId);
      if (!target || target.role === 'owner') throw new ApiError('teamOwnerOnly');
      if (target.role === 'admin' && role !== 'owner') throw new ApiError('teamOwnerOnly');
      saveTeam({ ...team, members: team.members.filter((member) => member.accountId !== accountId) });
      const removed = findById(accountId);
      if (removed) saveAccount(withAlert(removed, 'teamRemoved', { team: team.name }));
      return session();
    }),

  acceptInvite: (teamId: string) =>
    call(() => {
      const account = signedInAccount();
      if (teamOf(account.id)) throw new ApiError('alreadyInTeam');
      const team = readTeams().find((candidate) => candidate.id === teamId);
      const invite = team?.invites.find((candidate) => candidate.email === account.email);
      if (!team || !invite) throw new ApiError('inviteNotFound');
      saveTeam({ ...team, members: [...team.members, memberFor(account, invite.role)], invites: team.invites.filter((candidate) => candidate.id !== invite.id) });
      return session();
    }),

  declineInvite: (teamId: string) =>
    call(() => {
      const account = signedInAccount();
      writeTeams(readTeams().map((team) => (team.id === teamId ? { ...team, invites: team.invites.filter((invite) => invite.email !== account.email) } : team)));
      return session();
    }),

  // A member or admin leaves the team. The owner can't: the team is their plan.
  leave: () =>
    call(() => {
      const { account, team, role } = myTeam();
      if (role === 'owner') throw new ApiError('teamOwnerOnly');
      saveTeam({ ...team, members: team.members.filter((member) => member.accountId !== account.id) });
      return session();
    }),

  // Every license issued on the team's plan, with who downloaded it. Members can use all of them.
  licenses: () =>
    call(() => {
      const { team } = myTeam();
      return readLicenses()
        .filter((license) => license.teamId === team.id)
        .map((license) => ({ ...license, downloadedBy: findById(license.ownerId)?.name ?? '' }));
    }),
};
