import { Elysia } from "elysia";
import { registerRoutes } from "./infrastructure/http/routes";
import { InMemoryDatabase } from "./infrastructure/persistence/in-memory/database";
import {
  InMemoryGroupRepository,
  InMemoryMatchRepository,
  InMemoryParticipantRepository,
  InMemoryPlayerRepository,
  InMemoryTeamMemberRepository,
  InMemoryTeamRepository,
  InMemoryTournamentEntryRepository,
  InMemoryTournamentRepository,
} from "./infrastructure/persistence/in-memory/repositories";
import { RandomIdGenerator } from "./infrastructure/services/id-generator";
import { SystemClock } from "./infrastructure/services/clock";
import {
  AddTeamMemberUseCase,
  CreateGroupUseCase,
  CreateMatchUseCase,
  CreateParticipantUseCase,
  CreatePlayerUseCase,
  CreateTeamUseCase,
  CreateTournamentUseCase,
  RegisterTournamentEntryUseCase,
} from "./application/use-cases";

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

const app = registerRoutes(new Elysia(), { useCases, repositories })
  .onError(({ error, set }) => {
    console.error(error);
    set.status = 500;
    return { message: "Internal Server Error" };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
