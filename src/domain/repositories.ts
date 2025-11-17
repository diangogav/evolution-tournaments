import type {
  Group,
  Match,
  Participant,
  Player,
  Team,
  TeamMember,
  Tournament,
  TournamentEntry,
  UUID,
} from "./models";

export interface PlayerRepository {
  create(player: Player): Player;
  list(): Player[];
  findById(id: UUID): Player | undefined;
}

export interface TeamRepository {
  create(team: Team): Team;
  list(): Team[];
  findById(id: UUID): Team | undefined;
}

export interface TeamMemberRepository {
  create(member: TeamMember): TeamMember;
  listByTeam(teamId: UUID): TeamMember[];
}

export interface ParticipantRepository {
  create(participant: Participant): Participant;
  list(): Participant[];
  findById(id: UUID): Participant | undefined;
}

export interface TournamentRepository {
  create(tournament: Tournament): Tournament;
  list(): Tournament[];
  findById(id: UUID): Tournament | undefined;
}

export interface TournamentEntryRepository {
  create(entry: TournamentEntry): TournamentEntry;
  listByTournament(tournamentId: UUID): TournamentEntry[];
}

export interface GroupRepository {
  create(group: Group): Group;
  list(): Group[];
}

export interface MatchRepository {
  create(match: Match): Match;
  list(): Match[];
}

