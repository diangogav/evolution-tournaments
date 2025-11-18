export type UUID = string;

export interface Identified {
  id: UUID;
}

export type ParticipantType = "PLAYER" | "TEAM";

export type TournamentFormat =
  | "ROUND_ROBIN"
  | "SWISS"
  | "SINGLE_ELIMINATION"
  | "DOUBLE_ELIMINATION";

export type TournamentStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

export type TournamentEntryStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"

export type MatchResult = "win" | "loss" | "draw";

