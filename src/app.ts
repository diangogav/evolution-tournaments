// src/app.ts
import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";

import { registerRoutes } from "./infrastructure/http/routes";

import { RandomIdGenerator } from "./modules/shared/infrastructure/services/id-generator";
import { SystemClock } from "./modules/shared/infrastructure/services/clock";

// Prisma Repositories
import { PrismaPlayerRepository } from "./modules/players/infrastructure/persistence/prisma/player.repository";
import { PrismaTeamRepository } from "./modules/teams/infrastructure/persistence/prisma/team.repository";
import { PrismaTeamMemberRepository } from "./modules/teams/infrastructure/persistence/prisma/team-member.repository";
import { PrismaParticipantRepository } from "./modules/participants/infrastructure/persistence/prisma/participant.repository";
import { PrismaTournamentRepository } from "./modules/tournaments/infrastructure/persistence/prisma/tournament.repository";
import { PrismaTournamentEntryRepository } from "./modules/tournaments/infrastructure/persistence/prisma/tournament-entry.repository";
import { PrismaGroupRepository } from "./modules/groups/infrastructure/persistence/prisma/group.repository";
import { PrismaMatchRepository } from "./modules/matches/infrastructure/persistence/prisma/match.repository";

// Use Cases
import { CreatePlayerUseCase } from "./modules/players/application/create-player.use-case";
import { CreateTeamUseCase } from "./modules/teams/application/create-team.use-case";
import { AddTeamMemberUseCase } from "./modules/teams/application/add-team-member.use-case";
import { CreateParticipantUseCase } from "./modules/participants/application/create-participant.use-case";
import { CreateTournamentUseCase } from "./modules/tournaments/application/create-tournament.use-case";
import { RegisterTournamentEntryUseCase } from "./modules/tournaments/application/register-tournament-entry.use-case";
import { CreateGroupUseCase } from "./modules/groups/application/create-group.use-case";
import { CreateMatchUseCase } from "./modules/matches/application/create-match.use-case";
import { RecordMatchResultUseCase } from "./modules/matches/application/record-match-result.use-case";
import { GenerateSingleEliminationBracketUseCase } from "./modules/tournaments/application/generate-single-elimination-bracket.use-case";
import { ListMatchesByTournamentUseCase } from "./modules/matches/application/list-matches-by-tournament.use-case";
import { GenerateFullBracketUseCase } from "./modules/tournaments/application/generate-full-bracket.use-case";
import { BracketViewUseCase } from "./modules/tournaments/application/view-bracket.use-case";

export const buildApp = async (externalPrisma?: PrismaClient) => {
  const prisma = externalPrisma ?? new PrismaClient();

  const idGenerator = new RandomIdGenerator();
  const clock = new SystemClock();

  // ----------------------------------------
  // REPOSITORIES
  // ----------------------------------------
  const repositories = {
    players: new PrismaPlayerRepository(prisma),
    teams: new PrismaTeamRepository(prisma),
    teamMembers: new PrismaTeamMemberRepository(prisma),
    participants: new PrismaParticipantRepository(prisma),
    tournaments: new PrismaTournamentRepository(prisma),
    entries: new PrismaTournamentEntryRepository(prisma),
    groups: new PrismaGroupRepository(prisma),
    matches: new PrismaMatchRepository(prisma),
  } as const;

  // ----------------------------------------
  // USE CASES
  // ----------------------------------------
  const createMatch = new CreateMatchUseCase(
    repositories.matches,
    repositories.tournaments,
    repositories.participants,
    idGenerator
  )

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
    createMatch,
    listMatchesByTournament: new ListMatchesByTournamentUseCase(
      repositories.matches,
      repositories.tournaments,
    ),
    generateSingleEliminationBracket: new GenerateSingleEliminationBracketUseCase(
      repositories.tournaments,
      repositories.entries,
      repositories.matches,
      repositories.participants,
      idGenerator,
      createMatch,
    ),
    recordMatchResult: new RecordMatchResultUseCase(
      repositories.matches,
      repositories.tournaments,
      repositories.participants,
      idGenerator,
      createMatch,
    ),
    generateFullBracket: new GenerateFullBracketUseCase(
      repositories.tournaments,
      repositories.entries,
      repositories.matches,
      repositories.participants,
      idGenerator,
      createMatch,
    ),
    bracketView: new BracketViewUseCase(
      repositories.tournaments,
      repositories.matches,
      repositories.participants,
    ),
  } as const;

  // ----------------------------------------
  // BUILD APP
  // ----------------------------------------
  const app = registerRoutes(new Elysia(), {
    useCases,
    repositories
  }).onError(({ error, set }) => {
    console.error("❌ Internal Error:", error);
    set.status = 500;
    return { message: "Internal Server Error" };
  });

  return { app, repositories, useCases, prisma };
};
