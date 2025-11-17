import { t } from "elysia";

export const IdentifierSchema = t.String({ minLength: 1 });

export const ParticipantTypeSchema = t.Union([
  t.Literal("player"),
  t.Literal("team"),
]);

export const TournamentFormatSchema = t.Union([
  t.Literal("round_robin"),
  t.Literal("group_stage"),
  t.Literal("single_elimination"),
  t.Literal("double_elimination"),
]);

export const TournamentStatusSchema = t.Union([
  t.Literal("draft"),
  t.Literal("registration"),
  t.Literal("in_progress"),
  t.Literal("completed"),
  t.Literal("archived"),
]);

export const TournamentEntryStatusSchema = t.Union([
  t.Literal("pending"),
  t.Literal("confirmed"),
  t.Literal("eliminated"),
  t.Literal("dropped"),
]);

export const MatchResultSchema = t.Union([
  t.Literal("win"),
  t.Literal("loss"),
  t.Literal("draw"),
]);

export const CreatePlayerBody = t.Object({
  displayName: t.String(),
  nickname: t.Optional(t.String()),
  birthDate: t.Optional(t.String({ format: "date" })),
  countryCode: t.Optional(t.String({ pattern: "^[A-Z]{2}$" })),
  contactEmail: t.Optional(t.String({ format: "email" })),
  preferredDisciplines: t.Optional(t.Array(t.String())),
  isActive: t.Optional(t.Boolean()),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export const CreateTeamBody = t.Object({
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

export const AddTeamMemberBody = t.Object({
  teamId: IdentifierSchema,
  playerId: IdentifierSchema,
  role: t.Optional(t.String()),
  isCaptain: t.Optional(t.Boolean()),
});

export const CreateParticipantBody = t.Object({
  type: ParticipantTypeSchema,
  referenceId: IdentifierSchema,
  displayName: t.String(),
  countryCode: t.Optional(t.String({ pattern: "^[A-Z]{2}$" })),
  seeding: t.Optional(t.Number({ minimum: 1 })),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export const CreateTournamentBody = t.Object({
  name: t.String(),
  description: t.Optional(t.String()),
  discipline: t.String(),
  format: TournamentFormatSchema,
  status: TournamentStatusSchema,
  allowMixedParticipants: t.Optional(t.Boolean()),
  participantType: t.Optional(ParticipantTypeSchema),
  maxParticipants: t.Optional(t.Number({ minimum: 2 })),
  startAt: t.Optional(t.String({ format: "date-time" })),
  endAt: t.Optional(t.String({ format: "date-time" })),
  location: t.Optional(t.String()),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export const CreateTournamentEntryBody = t.Object({
  tournamentId: IdentifierSchema,
  participantId: IdentifierSchema,
  status: t.Optional(TournamentEntryStatusSchema),
  groupId: t.Optional(IdentifierSchema),
  seed: t.Optional(t.Number({ minimum: 1 })),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export const CreateGroupBody = t.Object({
  tournamentId: IdentifierSchema,
  name: t.String(),
  participants: t.Array(IdentifierSchema, { minItems: 2 }),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export const CreateMatchParticipantBody = t.Object({
  participantId: IdentifierSchema,
  score: t.Optional(t.Number({ minimum: 0 })),
  result: t.Optional(MatchResultSchema),
  lineup: t.Optional(t.Array(IdentifierSchema)),
});

export const CreateMatchBody = t.Object({
  tournamentId: IdentifierSchema,
  roundNumber: t.Number({ minimum: 1 }),
  stage: t.Optional(t.String()),
  bestOf: t.Optional(t.Number({ minimum: 1 })),
  scheduledAt: t.Optional(t.String({ format: "date-time" })),
  participants: t.Array(CreateMatchParticipantBody, {
    minItems: 2,
    maxItems: 2,
  }),
  metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

