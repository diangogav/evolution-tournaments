import { Elysia } from "elysia";
import { registerRoutes } from "./infrastructure/http/routes";
import { InMemoryDatabase } from "./infrastructure/persistence/in-memory/database";
import { RandomIdGenerator } from "./modules/shared/infrastructure/services/id-generator";
import { SystemClock } from "./modules/shared/infrastructure/services/clock";
import { CreatePlayerUseCase } from "./modules/players/application/create-player.use-case";
import { CreateTeamUseCase } from "./modules/teams/application/create-team.use-case";
import { AddTeamMemberUseCase } from "./modules/teams/application/add-team-member.use-case";
import { CreateParticipantUseCase } from "./modules/participants/application/create-participant.use-case";
import { CreateTournamentUseCase } from "./modules/tournaments/application/create-tournament.use-case";
import { RegisterTournamentEntryUseCase } from "./modules/tournaments/application/register-tournament-entry.use-case";
import { CreateGroupUseCase } from "./modules/groups/application/create-group.use-case";
import { CreateMatchUseCase } from "./modules/matches/application/create-match.use-case";
import { InMemoryPlayerRepository } from "./modules/players/infrastructure/persistence/in-memory/player.repository";
import { InMemoryTeamRepository } from "./modules/teams/infrastructure/persistence/in-memory/team.repository";
import { InMemoryTeamMemberRepository } from "./modules/teams/infrastructure/persistence/in-memory/team-member.repository";
import { InMemoryParticipantRepository } from "./modules/participants/infrastructure/persistence/in-memory/participant.repository";
import { InMemoryTournamentRepository } from "./modules/tournaments/infrastructure/persistence/in-memory/tournament.repository";
import { InMemoryTournamentEntryRepository } from "./modules/tournaments/infrastructure/persistence/in-memory/tournament-entry.repository";
import { InMemoryGroupRepository } from "./modules/groups/infrastructure/persistence/in-memory/group.repository";
import { InMemoryMatchRepository } from "./modules/matches/infrastructure/persistence/in-memory/match.repository";
import { AppDataSource } from "./infrastructure/persistence/typeorm/data-source";
import { TypeOrmPlayerRepository } from "./modules/players/infrastructure/persistence/typeorm/player.repository";
import { TypeOrmTeamRepository } from "./modules/teams/infrastructure/persistence/typeorm/team.repository";
import { TypeOrmTeamMemberRepository } from "./modules/teams/infrastructure/persistence/typeorm/team-member.repository";
import { TypeOrmParticipantRepository } from "./modules/participants/infrastructure/persistence/typeorm/participant.repository";
import { TypeOrmTournamentRepository } from "./modules/tournaments/infrastructure/persistence/typeorm/tournament.repository";
import { TypeOrmTournamentEntryRepository } from "./modules/tournaments/infrastructure/persistence/typeorm/tournament-entry.repository";
import { TypeOrmGroupRepository } from "./modules/groups/infrastructure/persistence/typeorm/group.repository";
import { TypeOrmMatchRepository } from "./modules/matches/infrastructure/persistence/typeorm/match.repository";
import { PlayerEntity } from "./infrastructure/persistence/typeorm/entities/player.entity";
import { TeamEntity } from "./infrastructure/persistence/typeorm/entities/team.entity";
import { TeamMemberEntity } from "./infrastructure/persistence/typeorm/entities/team-member.entity";
import { ParticipantEntity } from "./infrastructure/persistence/typeorm/entities/participant.entity";
import { TournamentEntity } from "./infrastructure/persistence/typeorm/entities/tournament.entity";
import { TournamentEntryEntity } from "./infrastructure/persistence/typeorm/entities/tournament-entry.entity";
import { GroupEntity } from "./infrastructure/persistence/typeorm/entities/group.entity";
import { MatchEntity } from "./infrastructure/persistence/typeorm/entities/match.entity";

export const buildApp = async () => {
  const useTypeOrm = process.env.USE_TYPEORM === "true";
  const idGenerator = new RandomIdGenerator();
  const clock = new SystemClock();

  let repositories;

  if (useTypeOrm) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    repositories = {
      players: new TypeOrmPlayerRepository(AppDataSource.getRepository(PlayerEntity)),
      teams: new TypeOrmTeamRepository(AppDataSource.getRepository(TeamEntity)),
      teamMembers: new TypeOrmTeamMemberRepository(AppDataSource.getRepository(TeamMemberEntity)),
      participants: new TypeOrmParticipantRepository(AppDataSource.getRepository(ParticipantEntity)),
      tournaments: new TypeOrmTournamentRepository(AppDataSource.getRepository(TournamentEntity)),
      entries: new TypeOrmTournamentEntryRepository(AppDataSource.getRepository(TournamentEntryEntity)),
      groups: new TypeOrmGroupRepository(AppDataSource.getRepository(GroupEntity)),
      matches: new TypeOrmMatchRepository(AppDataSource.getRepository(MatchEntity)),
    } as const;
  } else {
    const db = new InMemoryDatabase();
    repositories = {
      players: new InMemoryPlayerRepository(db),
      teams: new InMemoryTeamRepository(db),
      teamMembers: new InMemoryTeamMemberRepository(db),
      participants: new InMemoryParticipantRepository(db),
      tournaments: new InMemoryTournamentRepository(db),
      entries: new InMemoryTournamentEntryRepository(db),
      groups: new InMemoryGroupRepository(db),
      matches: new InMemoryMatchRepository(db),
    } as const;
  }

  const useCases = {
    createPlayer: new CreatePlayerUseCase(repositories.players, idGenerator),
    createTeam: new CreateTeamUseCase(repositories.teams, idGenerator),
    addTeamMember: new AddTeamMemberUseCase(
      repositories.teamMembers,
      repositories.teams,
      repositories.players,
      idGenerator,
      clock
    ),
    createParticipant: new CreateParticipantUseCase(
      repositories.participants,
      repositories.players,
      repositories.teams,
      idGenerator
    ),
    createTournament: new CreateTournamentUseCase(
      repositories.tournaments,
      idGenerator
    ),
    registerTournamentEntry: new RegisterTournamentEntryUseCase(
      repositories.entries,
      repositories.tournaments,
      repositories.participants,
      idGenerator
    ),
    createGroup: new CreateGroupUseCase(
      repositories.groups,
      repositories.tournaments,
      repositories.participants,
      idGenerator
    ),
    createMatch: new CreateMatchUseCase(
      repositories.matches,
      repositories.tournaments,
      repositories.participants,
      idGenerator
    ),
  } as const;

  const app = registerRoutes(new Elysia(), { useCases, repositories }).onError(
    ({ error, set }) => {
      console.error(error);
      set.status = 500;
      return { message: "Internal Server Error" };
    }
  );

  return { app, repositories, useCases };
};

