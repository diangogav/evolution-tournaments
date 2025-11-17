export type UUID = string;

export interface Identified {
  id: UUID;
}

export type ParticipantType = "player" | "team";

export type TournamentFormat =
  | "round_robin"
  | "group_stage"
  | "single_elimination"
  | "double_elimination";

export type TournamentStatus =
  | "draft"
  | "registration"
  | "in_progress"
  | "completed"
  | "archived";

export type TournamentEntryStatus =
  | "pending"
  | "confirmed"
  | "eliminated"
  | "dropped";

export type MatchResult = "win" | "loss" | "draw";

