import type {
  Group,
  Match,
  Participant,
  ParticipantType,
  Player,
  Team,
  TeamMember,
  Tournament,
  TournamentEntry,
  TournamentEntryStatus,
  TournamentFormat,
  TournamentStatus,
  UUID,
} from "../domain/models";
import type {
  GroupRepository,
  MatchRepository,
  ParticipantRepository,
  PlayerRepository,
  TeamMemberRepository,
  TeamRepository,
  TournamentEntryRepository,
  TournamentRepository,
} from "../domain/repositories";
import type { Clock, IdGenerator } from "./ports";

export class CreatePlayerUseCase {
  constructor(
    private readonly players: PlayerRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    displayName: string;
    nickname?: string;
    birthDate?: string;
    countryCode?: string;
    contactEmail?: string;
    preferredDisciplines?: string[];
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }): Player {
    const player: Player = {
      id: this.ids.generate(),
      displayName: input.displayName,
      nickname: input.nickname,
      birthDate: input.birthDate,
      countryCode: input.countryCode,
      contactEmail: input.contactEmail,
      preferredDisciplines: input.preferredDisciplines,
      isActive: input.isActive ?? true,
      metadata: input.metadata,
    };

    return this.players.create(player);
  }
}

export class CreateTeamUseCase {
  constructor(
    private readonly teams: TeamRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    displayName: string;
    shortCode?: string;
    logoUrl?: string;
    managerName?: string;
    minMembers: number;
    maxMembers: number;
    countryCode?: string;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }): Team {
    if (input.maxMembers < input.minMembers) {
      throw new Error("maxMembers must be greater than or equal to minMembers");
    }

    const team: Team = {
      id: this.ids.generate(),
      displayName: input.displayName,
      shortCode: input.shortCode,
      logoUrl: input.logoUrl,
      managerName: input.managerName,
      minMembers: input.minMembers,
      maxMembers: input.maxMembers,
      countryCode: input.countryCode,
      isActive: input.isActive ?? true,
      metadata: input.metadata,
    };

    return this.teams.create(team);
  }
}

export class AddTeamMemberUseCase {
  constructor(
    private readonly teamMembers: TeamMemberRepository,
    private readonly teams: TeamRepository,
    private readonly players: PlayerRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock
  ) {}

  execute(input: {
    teamId: UUID;
    playerId: UUID;
    role?: string;
    isCaptain?: boolean;
  }): TeamMember {
    const team = this.teams.findById(input.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    const player = this.players.findById(input.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    const member: TeamMember = {
      id: this.ids.generate(),
      teamId: team.id,
      playerId: player.id,
      role: input.role,
      isCaptain: input.isCaptain ?? false,
      joinedAt: this.clock.now().toISOString(),
    };

    return this.teamMembers.create(member);
  }
}

export class CreateParticipantUseCase {
  constructor(
    private readonly participants: ParticipantRepository,
    private readonly players: PlayerRepository,
    private readonly teams: TeamRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    type: ParticipantType;
    referenceId: UUID;
    displayName: string;
    countryCode?: string;
    seeding?: number;
    metadata?: Record<string, unknown>;
  }): Participant {
    if (input.type === "player" && !this.players.findById(input.referenceId)) {
      throw new Error("Player reference not found");
    }

    if (input.type === "team" && !this.teams.findById(input.referenceId)) {
      throw new Error("Team reference not found");
    }

    const participant: Participant = {
      id: this.ids.generate(),
      ...input,
    };

    return this.participants.create(participant);
  }
}

export class CreateTournamentUseCase {
  constructor(
    private readonly tournaments: TournamentRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    name: string;
    description?: string;
    discipline: string;
    format: TournamentFormat;
    status: TournamentStatus;
    allowMixedParticipants?: boolean;
    participantType?: ParticipantType;
    maxParticipants?: number;
    startAt?: string;
    endAt?: string;
    location?: string;
    metadata?: Record<string, unknown>;
  }): Tournament {
    const allowMixed = input.allowMixedParticipants ?? false;
    if (!allowMixed && !input.participantType) {
      throw new Error(
        "participantType is required when mixed participants are disabled"
      );
    }

    const tournament: Tournament = {
      id: this.ids.generate(),
      name: input.name,
      description: input.description,
      discipline: input.discipline,
      format: input.format,
      status: input.status,
      allowMixedParticipants: allowMixed,
      participantType: input.participantType,
      maxParticipants: input.maxParticipants,
      startAt: input.startAt,
      endAt: input.endAt,
      location: input.location,
      metadata: input.metadata,
    };

    return this.tournaments.create(tournament);
  }
}

export class RegisterTournamentEntryUseCase {
  constructor(
    private readonly entries: TournamentEntryRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    tournamentId: UUID;
    participantId: UUID;
    status?: TournamentEntryStatus;
    groupId?: UUID;
    seed?: number;
    metadata?: Record<string, unknown>;
  }): TournamentEntry {
    const tournament = this.tournaments.findById(input.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const participant = this.participants.findById(input.participantId);
    if (!participant) {
      throw new Error("Participant not found");
    }

    if (
      !tournament.allowMixedParticipants &&
      tournament.participantType !== participant.type
    ) {
      throw new Error("Participant type not allowed in tournament");
    }

    const entry: TournamentEntry = {
      id: this.ids.generate(),
      tournamentId: tournament.id,
      participantId: participant.id,
      status: input.status ?? "pending",
      groupId: input.groupId,
      seed: input.seed,
      metadata: input.metadata,
    };

    return this.entries.create(entry);
  }
}

export class CreateGroupUseCase {
  constructor(
    private readonly groups: GroupRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    tournamentId: UUID;
    name: string;
    participants: UUID[];
    metadata?: Record<string, unknown>;
  }): Group {
    const tournament = this.tournaments.findById(input.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    input.participants.forEach((participantId) => {
      if (!this.participants.findById(participantId)) {
        throw new Error(`Participant ${participantId} not found`);
      }
    });

    const group: Group = {
      id: this.ids.generate(),
      tournamentId: tournament.id,
      name: input.name,
      participants: input.participants,
      metadata: input.metadata,
    };

    return this.groups.create(group);
  }
}

export class CreateMatchUseCase {
  constructor(
    private readonly matches: MatchRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    tournamentId: UUID;
    roundNumber: number;
    stage?: string;
    bestOf?: number;
    scheduledAt?: string;
    participants: [Match["participants"][0], Match["participants"][1]];
    metadata?: Record<string, unknown>;
  }): Match {
    const tournament = this.tournaments.findById(input.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    input.participants.forEach(({ participantId }) => {
      if (!this.participants.findById(participantId)) {
        throw new Error(`Participant ${participantId} not found`);
      }
    });

    const match: Match = {
      id: this.ids.generate(),
      tournamentId: tournament.id,
      roundNumber: input.roundNumber,
      stage: input.stage,
      bestOf: input.bestOf,
      scheduledAt: input.scheduledAt,
      completedAt: undefined,
      format: tournament.format,
      participants: input.participants,
      metadata: input.metadata,
    };

    return this.matches.create(match);
  }
}

