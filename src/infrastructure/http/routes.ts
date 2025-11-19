import { Elysia, t } from "elysia";
import {
  AddTeamMemberBody,
  CreateGroupBody,
  CreateMatchBody,
  CreateParticipantBody,
  CreatePlayerBody,
  CreateTeamBody,
  CreateTournamentBody,
  CreateTournamentEntryBody,
  IdentifierSchema,
  RecordMatchResultBody,
} from "./schemas";
import type { CreateGroupUseCase } from "../../modules/groups/application/create-group.use-case";
import type { GroupRepository } from "../../modules/groups/domain/group.repository";
import type { CreateMatchUseCase } from "../../modules/matches/application/create-match.use-case";
import type { MatchRepository } from "../../modules/matches/domain/match.repository";
import type { CreateParticipantUseCase } from "../../modules/participants/application/create-participant.use-case";
import type { ParticipantRepository } from "../../modules/participants/domain/participant.repository";
import type { CreatePlayerUseCase } from "../../modules/players/application/create-player.use-case";
import type { PlayerRepository } from "../../modules/players/domain/player.repository";
import type { CreateTeamUseCase } from "../../modules/teams/application/create-team.use-case";
import type { TeamRepository } from "../../modules/teams/domain/team.repository";
import type { AddTeamMemberUseCase } from "../../modules/teams/application/add-team-member.use-case";
import type { TeamMemberRepository } from "../../modules/teams/domain/team-member.repository";
import type { CreateTournamentUseCase } from "../../modules/tournaments/application/create-tournament.use-case";
import type { RegisterTournamentEntryUseCase } from "../../modules/tournaments/application/register-tournament-entry.use-case";
import { GenerateSingleEliminationBracketUseCase } from "../../modules/tournaments/application/generate-single-elimination-bracket.use-case";
import type { TournamentRepository } from "../../modules/tournaments/domain/tournament.repository";
import type { TournamentEntryRepository } from "../../modules/tournaments/domain/tournament-entry.repository";
import { RecordMatchResultUseCase } from "../../modules/matches/application/record-match-result.use-case";

export type HttpDependencies = {
  useCases: {
    createPlayer: CreatePlayerUseCase;
    createTeam: CreateTeamUseCase;
    addTeamMember: AddTeamMemberUseCase;
    createParticipant: CreateParticipantUseCase;
    createTournament: CreateTournamentUseCase;
    registerTournamentEntry: RegisterTournamentEntryUseCase;
    createGroup: CreateGroupUseCase;
    createMatch: CreateMatchUseCase;
    generateSingleEliminationBracket: GenerateSingleEliminationBracketUseCase;
    recordMatchResult: RecordMatchResultUseCase;
  };
  repositories: {
    players: PlayerRepository;
    teams: TeamRepository;
    teamMembers: TeamMemberRepository;
    participants: ParticipantRepository;
    tournaments: TournamentRepository;
    entries: TournamentEntryRepository;
    groups: GroupRepository;
    matches: MatchRepository;
  };
};

export const registerRoutes = (
  app: Elysia,
  deps: HttpDependencies
): Elysia => {
  const { useCases, repositories } = deps;

  return app
    .get("/", () => ({
      service: "tournaments",
      version: "1.0.0",
      docs: "/docs",
    }))
    .group("/players", (app) =>
      app
        .get("/", () => repositories.players.list())
        .post(
          "/",
          ({ body, set }) => {
            const player = useCases.createPlayer.execute(body);
            set.status = 201;
            return player;
          },
          { body: CreatePlayerBody }
        )
    )
    .group("/teams", (app) =>
      app
        .get("/", () => repositories.teams.list())
        .post(
          "/",
          ({ body, set }) => {
            const team = useCases.createTeam.execute(body);
            set.status = 201;
            return team;
          },
          { body: CreateTeamBody }
        )
        .post(
          "/members",
          ({ body, set }) => {
            const member = useCases.addTeamMember.execute(body);
            set.status = 201;
            return member;
          },
          { body: AddTeamMemberBody }
        )
    )
    .group("/participants", (app) =>
      app
        .get("/", () => repositories.participants.list())
        .post(
          "/",
          async ({ body, set }) => {
            const participant = await useCases.createParticipant.execute(body);
            set.status = 201;
            return participant.toPrimitives();
          },
          { body: CreateParticipantBody }
        )
    )
    .group("/tournaments", (app) =>
      app
        .get("/", () => repositories.tournaments.list())
        .get(
          "/:id",
          ({ params, set }) => {
            const tournament = repositories.tournaments.findById(params.id);
            if (!tournament) {
              set.status = 404;
              return { message: "Tournament not found" };
            }
            return tournament;
          },
          { params: t.Object({ id: IdentifierSchema }) }
        )
        .post(
          "/",
          ({ body, set }) => {
            const tournament = useCases.createTournament.execute(body);
            set.status = 201;
            return tournament;
          },
          { body: CreateTournamentBody }
        )
        .post(
          "/entries",
          ({ body, set }) => {
            const entry = useCases.registerTournamentEntry.execute(body);
            set.status = 201;
            return entry;
          },
          { body: CreateTournamentEntryBody }
        )
        .get(
          "/:id/entries",
          ({ params }) =>
            repositories.entries.listByTournament(params.id),
          { params: t.Object({ id: IdentifierSchema }) }
        )
        .post(
          "/:id/generate-bracket",
          async ({ params, set }) => {
            await useCases.generateSingleEliminationBracket.execute({
              tournamentId: params.id,
            });
            set.status = 201;
            return { message: "Bracket generated successfully" };
          },
          { params: t.Object({ id: IdentifierSchema }) }
        )
    )
    .group("/groups", (app) =>
      app
        .get("/", () => repositories.groups.list())
        .post(
          "/",
          ({ body, set }) => {
            const group = useCases.createGroup.execute(body);
            set.status = 201;
            return group;
          },
          { body: CreateGroupBody }
        )
    )
    .group("/matches", (app) =>
      app
        .get("/", () => repositories.matches.list())
        .post(
          "/",
          ({ body, set }) => {
            const participants = body.participants as [
              (typeof body.participants)[number],
              (typeof body.participants)[number]
            ];
            const match = useCases.createMatch.execute({
              ...body,
              participants,
            });
            set.status = 201;
            return match;
          },
          { body: CreateMatchBody }
        )
        .post(
          "/:id/result",
          async ({ params, body, set }) => {
            await useCases.recordMatchResult.execute({
              matchId: params.id,
              participants: body.participants as any,
            });
            set.status = 200;
            return { message: "Match result recorded successfully" };
          },
          {
            params: t.Object({ id: IdentifierSchema }),
            body: RecordMatchResultBody,
          }
        )
    );
};

