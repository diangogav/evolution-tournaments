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

export const buildApp = () => {
  const db = new InMemoryDatabase();
  const idGenerator = new RandomIdGenerator();
  const clock = new SystemClock();

  const repositories = {
    players: new InMemoryPlayerRepository(db),
    teams: new InMemoryTeamRepository(db),
    teamMembers: new InMemoryTeamMemberRepository(db),
    participants: new InMemoryParticipantRepository(db),
    tournaments: new InMemoryTournamentRepository(db),
    entries: new InMemoryTournamentEntryRepository(db),
    groups: new InMemoryGroupRepository(db),
    matches: new InMemoryMatchRepository(db),
  } as const;

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

