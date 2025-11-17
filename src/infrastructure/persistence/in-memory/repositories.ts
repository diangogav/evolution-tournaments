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
} from "../../../domain/models";
import type {
  GroupRepository,
  MatchRepository,
  ParticipantRepository,
  PlayerRepository,
  TeamMemberRepository,
  TeamRepository,
  TournamentEntryRepository,
  TournamentRepository,
} from "../../../domain/repositories";
import { InMemoryDatabase } from "./database";

abstract class BaseRepository<T extends { id: UUID }> {
  constructor(private readonly store: Map<UUID, T>) {}

  protected save(entity: T): T {
    this.store.set(entity.id, entity);
    return entity;
  }

  protected findAll(): T[] {
    return Array.from(this.store.values());
  }

  protected findOne(id: UUID): T | undefined {
    return this.store.get(id);
  }
}

export class InMemoryPlayerRepository
  extends BaseRepository<Player>
  implements PlayerRepository
{
  constructor(db: InMemoryDatabase) {
    super(db.collections.players);
  }

  create(player: Player): Player {
    return this.save(player);
  }

  list(): Player[] {
    return this.findAll();
  }

  findById(id: UUID): Player | undefined {
    return this.findOne(id);
  }
}

export class InMemoryTeamRepository
  extends BaseRepository<Team>
  implements TeamRepository
{
  constructor(db: InMemoryDatabase) {
    super(db.collections.teams);
  }

  create(team: Team): Team {
    return this.save(team);
  }

  list(): Team[] {
    return this.findAll();
  }

  findById(id: UUID): Team | undefined {
    return this.findOne(id);
  }
}

export class InMemoryTeamMemberRepository
  implements TeamMemberRepository
{
  constructor(private readonly db: InMemoryDatabase) {}

  create(member: TeamMember): TeamMember {
    this.db.collections.teamMembers.set(member.id, member);
    return member;
  }

  listByTeam(teamId: UUID): TeamMember[] {
    return Array.from(this.db.collections.teamMembers.values()).filter(
      (member) => member.teamId === teamId
    );
  }
}

export class InMemoryParticipantRepository
  extends BaseRepository<Participant>
  implements ParticipantRepository
{
  constructor(db: InMemoryDatabase) {
    super(db.collections.participants);
  }

  create(participant: Participant): Participant {
    return this.save(participant);
  }

  list(): Participant[] {
    return this.findAll();
  }

  findById(id: UUID): Participant | undefined {
    return this.findOne(id);
  }
}

export class InMemoryTournamentRepository
  extends BaseRepository<Tournament>
  implements TournamentRepository
{
  constructor(db: InMemoryDatabase) {
    super(db.collections.tournaments);
  }

  create(tournament: Tournament): Tournament {
    return this.save(tournament);
  }

  list(): Tournament[] {
    return this.findAll();
  }

  findById(id: UUID): Tournament | undefined {
    return this.findOne(id);
  }
}

export class InMemoryTournamentEntryRepository
  implements TournamentEntryRepository
{
  constructor(private readonly db: InMemoryDatabase) {}

  create(entry: TournamentEntry): TournamentEntry {
    this.db.collections.entries.set(entry.id, entry);
    return entry;
  }

  listByTournament(tournamentId: UUID): TournamentEntry[] {
    return Array.from(this.db.collections.entries.values()).filter(
      (entry) => entry.tournamentId === tournamentId
    );
  }
}

export class InMemoryGroupRepository
  extends BaseRepository<Group>
  implements GroupRepository
{
  constructor(db: InMemoryDatabase) {
    super(db.collections.groups);
  }

  create(group: Group): Group {
    return this.save(group);
  }

  list(): Group[] {
    return this.findAll();
  }
}

export class InMemoryMatchRepository
  extends BaseRepository<Match>
  implements MatchRepository
{
  constructor(db: InMemoryDatabase) {
    super(db.collections.matches);
  }

  create(match: Match): Match {
    return this.save(match);
  }

  list(): Match[] {
    return this.findAll();
  }
}

