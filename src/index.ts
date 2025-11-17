import { randomUUID } from "node:crypto";
import { Elysia, t } from "elysia";
import {
  GroupSchema,
  MatchSchema,
  ParticipantSchema,
  PlayerSchema,
  TeamMemberSchema,
  TeamSchema,
  TournamentEntrySchema,
  TournamentSchema,
  type Group,
  type Match,
  type Participant,
  type Player,
  type Team,
  type TeamMember,
  type Tournament,
  type TournamentEntry,
} from "./domain/schemas";

type Collections = {
  players: Map<string, Player>;
  teams: Map<string, Team>;
  teamMembers: Map<string, TeamMember>;
  participants: Map<string, Participant>;
  tournaments: Map<string, Tournament>;
  entries: Map<string, TournamentEntry>;
  groups: Map<string, Group>;
  matches: Map<string, Match>;
};

const db: Collections = {
  players: new Map(),
  teams: new Map(),
  teamMembers: new Map(),
  participants: new Map(),
  tournaments: new Map(),
  entries: new Map(),
  groups: new Map(),
  matches: new Map(),
};

const withId = <T extends object>(payload: T): T & { id: string } => ({
  id: randomUUID(),
  ...payload,
});

const Identifier = t.String({ minLength: 1 });

const CreatePlayerBody = t.Object({
  displayName: t.String(),
  nickname: t.Optional(t.String()),
  birthDate: t.Optional(t.String({ format: "date" })),
  countryCode: t.Optional(t.String({ pattern: "^[A-Z]{2}$" })),
  contactEmail: t.Optional(t.String({ format: "email" })),
  preferredDisciplines: t.Optional(t.Array(t.String())),
  isActive: t.Optional(t.Boolean()),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

const CreateTeamBody = t.Object({
  displayName: t.String(),
  shortCode: t.Optional(t.String({ maxLength: 5 })),
  logoUrl: t.Optional(t.String({ format: "uri" })),
  managerName: t.Optional(t.String()),
  minMembers: t.Number({ minimum: 1, default: 1 }),
  maxMembers: t.Number({ minimum: 1 }),
  countryCode: t.Optional(t.String({ pattern: "^[A-Z]{2}$" })),
  isActive: t.Optional(t.Boolean()),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

const CreateTeamMemberBody = t.Object({
  teamId: Identifier,
  playerId: Identifier,
  role: t.Optional(t.String()),
  isCaptain: t.Optional(t.Boolean()),
});

const CreateParticipantBody = t.Object({
  type: t.Union([t.Literal("player"), t.Literal("team")]),
  referenceId: Identifier,
  displayName: t.String(),
  countryCode: t.Optional(t.String({ pattern: "^[A-Z]{2}$" })),
  seeding: t.Optional(t.Number({ minimum: 1 })),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

const CreateTournamentBody = t.Object({
  name: t.String(),
  description: t.Optional(t.String()),
  discipline: t.String(),
  format: t.Union([
    t.Literal("round_robin"),
    t.Literal("group_stage"),
    t.Literal("single_elimination"),
    t.Literal("double_elimination"),
  ]),
  status: t.Union([
    t.Literal("draft"),
    t.Literal("registration"),
    t.Literal("in_progress"),
    t.Literal("completed"),
    t.Literal("archived"),
  ]),
  allowMixedParticipants: t.Optional(t.Boolean()),
  participantType: t.Optional(t.Union([t.Literal("player"), t.Literal("team")])),
  maxParticipants: t.Optional(t.Number({ minimum: 2 })),
  startAt: t.Optional(t.String({ format: "date-time" })),
  endAt: t.Optional(t.String({ format: "date-time" })),
  location: t.Optional(t.String()),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

const CreateTournamentEntryBody = t.Object({
  tournamentId: Identifier,
  participantId: Identifier,
  status: t.Optional(
    t.Union([
      t.Literal("pending"),
      t.Literal("confirmed"),
      t.Literal("eliminated"),
      t.Literal("dropped"),
    ])
  ),
  groupId: t.Optional(Identifier),
  seed: t.Optional(t.Number({ minimum: 1 })),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

const CreateGroupBody = t.Object({
  tournamentId: Identifier,
  name: t.String(),
  participants: t.Array(Identifier, { minItems: 2 }),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

const CreateMatchBody = t.Object({
  tournamentId: Identifier,
  roundNumber: t.Number({ minimum: 1 }),
  stage: t.Optional(t.String()),
  bestOf: t.Optional(t.Number({ minimum: 1 })),
  scheduledAt: t.Optional(t.String({ format: "date-time" })),
  participants: t.Array(
    t.Object({
      participantId: Identifier,
      score: t.Optional(t.Number({ minimum: 0 })),
      result: t.Optional(
        t.Union([t.Literal("win"), t.Literal("loss"), t.Literal("draw")])
      ),
      lineup: t.Optional(t.Array(Identifier)),
    }),
    { minItems: 2, maxItems: 2 }
  ),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

const app = new Elysia()
  .get("/", () => ({
    service: "tournaments",
    version: "1.0.0",
    docs: "/docs",
  }))
  .group("/players", (app) =>
    app
      .get("/", () => Array.from(db.players.values()))
      .post(
        "/",
        ({ body, set }) => {
          const player = withId<Player>({
            ...body,
            isActive: body.isActive ?? true,
          });

          db.players.set(player.id, player);
          set.status = 201;
          return player;
        },
        { body: CreatePlayerBody }
      )
  )
  .group("/teams", (app) =>
    app
      .get("/", () => Array.from(db.teams.values()))
      .post(
        "/",
        ({ body, set }) => {
          const team = withId<Team>({
            ...body,
            isActive: body.isActive ?? true,
          });
          db.teams.set(team.id, team);
          set.status = 201;
          return team;
        },
        { body: CreateTeamBody }
      )
      .post(
        "/members",
        ({ body, set }) => {
          if (!db.teams.has(body.teamId)) {
            set.status = 404;
            return { message: "Team not found" };
          }
          if (!db.players.has(body.playerId)) {
            set.status = 404;
            return { message: "Player not found" };
          }

          const member = withId<TeamMember>({
            ...body,
            isCaptain: body.isCaptain ?? false,
            joinedAt: new Date().toISOString(),
          });

          db.teamMembers.set(member.id, member);
          set.status = 201;
          return member;
        },
        { body: CreateTeamMemberBody }
      )
  )
  .group("/participants", (app) =>
    app
      .get("/", () => Array.from(db.participants.values()))
      .post(
        "/",
        ({ body, set }) => {
          const exists =
            body.type === "player"
              ? db.players.has(body.referenceId)
              : db.teams.has(body.referenceId);

          if (!exists) {
            set.status = 404;
            return { message: `${body.type} reference not found` };
          }

          const participant = withId<Participant>({
            ...body,
          });

          db.participants.set(participant.id, participant);
          set.status = 201;
          return participant;
        },
        { body: CreateParticipantBody }
      )
  )
  .group("/tournaments", (app) =>
    app
      .get("/", () => Array.from(db.tournaments.values()))
      .get("/:id", ({ params, set }) => {
        const tournament = db.tournaments.get(params.id);
        if (!tournament) {
          set.status = 404;
          return { message: "Tournament not found" };
        }
        return tournament;
      })
      .post(
        "/",
        ({ body, set }) => {
          const tournament = withId<Tournament>({
            ...body,
            allowMixedParticipants: body.allowMixedParticipants ?? false,
          });

          if (
            !tournament.allowMixedParticipants &&
            !tournament.participantType
          ) {
            set.status = 400;
            return {
              message:
                "participantType is required when mixed participants are disabled",
            };
          }

          db.tournaments.set(tournament.id, tournament);
          set.status = 201;
          return tournament;
        },
        { body: CreateTournamentBody }
      )
      .post(
        "/entries",
        ({ body, set }) => {
          const { tournamentId, participantId } = body;
          const tournament = db.tournaments.get(tournamentId);
          const participant = db.participants.get(participantId);

          if (!tournament) {
            set.status = 404;
            return { message: "Tournament not found" };
          }

          if (!participant) {
            set.status = 404;
            return { message: "Participant not found" };
          }

          if (
            !tournament.allowMixedParticipants &&
            tournament.participantType !== participant.type
          ) {
            set.status = 400;
            return { message: "Participant type not allowed in tournament" };
          }

          const entry = withId<TournamentEntry>({
            ...body,
            status: body.status ?? "pending",
          });

          db.entries.set(entry.id, entry);
          set.status = 201;
          return entry;
        },
        { body: CreateTournamentEntryBody }
      )
      .get("/:id/entries", ({ params }) =>
        Array.from(db.entries.values()).filter(
          (entry) => entry.tournamentId === params.id
        )
      )
  )
  .group("/groups", (app) =>
    app
      .get("/", () => Array.from(db.groups.values()))
      .post(
        "/",
        ({ body, set }) => {
          if (!db.tournaments.has(body.tournamentId)) {
            set.status = 404;
            return { message: "Tournament not found" };
          }

          for (const participantId of body.participants) {
            if (!db.participants.has(participantId)) {
              set.status = 404;
              return { message: `Participant ${participantId} not found` };
            }
          }

          const group = withId<Group>(body);
          db.groups.set(group.id, group);
          set.status = 201;
          return group;
        },
        { body: CreateGroupBody }
      )
  )
  .group("/matches", (app) =>
    app
      .get("/", () => Array.from(db.matches.values()))
      .post(
        "/",
        ({ body, set }) => {
          if (!db.tournaments.has(body.tournamentId)) {
            set.status = 404;
            return { message: "Tournament not found" };
          }

          for (const participant of body.participants) {
            if (!db.participants.has(participant.participantId)) {
              set.status = 404;
              return {
                message: `Participant ${participant.participantId} not found`,
              };
            }
          }

          const match = withId<Match>({
            ...body,
            completedAt: undefined,
          });
          db.matches.set(match.id, match);
          set.status = 201;
          return match;
        },
        { body: CreateMatchBody }
      )
  )
  .onError(({ error, set }) => {
    console.error(error);
    set.status = 500;
    return { message: "Internal Server Error" };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
