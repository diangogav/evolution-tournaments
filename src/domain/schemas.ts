import { t, type Static } from "elysia";

const Identifier = t.String({ minLength: 1 });

const ParticipantTypeSchema = t.Union([
  t.Literal("player"),
  t.Literal("team"),
]);

const TournamentFormatSchema = t.Union([
  t.Literal("round_robin"),
  t.Literal("group_stage"),
  t.Literal("single_elimination"),
  t.Literal("double_elimination"),
]);

const TournamentStatusSchema = t.Union([
  t.Literal("draft"),
  t.Literal("registration"),
  t.Literal("in_progress"),
  t.Literal("completed"),
  t.Literal("archived"),
]);

export const PlayerSchema = t.Object({
  id: Identifier,
  displayName: t.String(),
  nickname: t.Optional(t.String()),
  birthDate: t.Optional(t.String({ format: "date" })),
  countryCode: t.Optional(t.String({ pattern: "^[A-Z]{2}$" })),
  contactEmail: t.Optional(t.String({ format: "email" })),
  preferredDisciplines: t.Optional(t.Array(t.String())),
  isActive: t.Boolean({ default: true }),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export type Player = Static<typeof PlayerSchema>;

export const TeamSchema = t.Object({
  id: Identifier,
  displayName: t.String(),
  shortCode: t.Optional(t.String({ maxLength: 5 })),
  logoUrl: t.Optional(t.String({ format: "uri" })),
  managerName: t.Optional(t.String()),
  minMembers: t.Number({ minimum: 1, default: 1 }),
  maxMembers: t.Number({ minimum: 1 }),
  countryCode: t.Optional(t.String({ pattern: "^[A-Z]{2}$" })),
  isActive: t.Boolean({ default: true }),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export type Team = Static<typeof TeamSchema>;

export const TeamMemberSchema = t.Object({
  id: Identifier,
  teamId: Identifier,
  playerId: Identifier,
  role: t.Optional(t.String()),
  isCaptain: t.Boolean({ default: false }),
  joinedAt: t.String({ format: "date-time" }),
  leftAt: t.Optional(t.String({ format: "date-time" })),
});

export type TeamMember = Static<typeof TeamMemberSchema>;

export const ParticipantSchema = t.Object({
  id: Identifier,
  type: ParticipantTypeSchema,
  referenceId: Identifier,
  displayName: t.String(),
  countryCode: t.Optional(t.String({ pattern: "^[A-Z]{2}$" })),
  seeding: t.Optional(t.Number({ minimum: 1 })),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export type Participant = Static<typeof ParticipantSchema>;

export const TournamentSchema = t.Object({
  id: Identifier,
  name: t.String(),
  description: t.Optional(t.String()),
  discipline: t.String(),
  format: TournamentFormatSchema,
  status: TournamentStatusSchema,
  allowMixedParticipants: t.Boolean({ default: false }),
  participantType: t.Optional(ParticipantTypeSchema),
  maxParticipants: t.Optional(t.Number({ minimum: 2 })),
  startAt: t.Optional(t.String({ format: "date-time" })),
  endAt: t.Optional(t.String({ format: "date-time" })),
  location: t.Optional(t.String()),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export type Tournament = Static<typeof TournamentSchema>;

export const TournamentEntrySchema = t.Object({
  id: Identifier,
  tournamentId: Identifier,
  participantId: Identifier,
  status: t.Union([
    t.Literal("pending"),
    t.Literal("confirmed"),
    t.Literal("eliminated"),
    t.Literal("dropped"),
  ]),
  groupId: t.Optional(Identifier),
  seed: t.Optional(t.Number({ minimum: 1 })),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export type TournamentEntry = Static<typeof TournamentEntrySchema>;

export const MatchParticipantSchema = t.Object({
  participantId: Identifier,
  score: t.Optional(t.Number({ minimum: 0 })),
  result: t.Optional(
    t.Union([t.Literal("win"), t.Literal("loss"), t.Literal("draw")])
  ),
  lineup: t.Optional(t.Array(Identifier)),
});

export type MatchParticipant = Static<typeof MatchParticipantSchema>;

export const MatchSchema = t.Object({
  id: Identifier,
  tournamentId: Identifier,
  roundNumber: t.Number({ minimum: 1 }),
  stage: t.Optional(t.String()),
  bestOf: t.Optional(t.Number({ minimum: 1 })),
  scheduledAt: t.Optional(t.String({ format: "date-time" })),
  completedAt: t.Optional(t.String({ format: "date-time" })),
  format: t.Optional(TournamentFormatSchema),
  participants: t.Array(MatchParticipantSchema, { minItems: 2, maxItems: 2 }),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export type Match = Static<typeof MatchSchema>;

export const GroupSchema = t.Object({
  id: Identifier,
  tournamentId: Identifier,
  name: t.String(),
  participants: t.Array(Identifier, { minItems: 2 }),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export type Group = Static<typeof GroupSchema>;

