export type UUID = string;

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

export interface Identified {
  id: UUID;
}

export interface Player extends Identified {
  displayName: string;
  nickname?: string;
  birthDate?: string;
  countryCode?: string;
  contactEmail?: string;
  preferredDisciplines?: string[];
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface Team extends Identified {
  displayName: string;
  shortCode?: string;
  logoUrl?: string;
  managerName?: string;
  minMembers: number;
  maxMembers: number;
  countryCode?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface TeamMember extends Identified {
  teamId: UUID;
  playerId: UUID;
  role?: string;
  isCaptain: boolean;
  joinedAt: string;
  leftAt?: string;
}

export interface Participant extends Identified {
  type: ParticipantType;
  referenceId: UUID;
  displayName: string;
  countryCode?: string;
  seeding?: number;
  metadata?: Record<string, unknown>;
}

export interface Tournament extends Identified {
  name: string;
  description?: string;
  discipline: string;
  format: TournamentFormat;
  status: TournamentStatus;
  allowMixedParticipants: boolean;
  participantType?: ParticipantType;
  maxParticipants?: number;
  startAt?: string;
  endAt?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface TournamentEntry extends Identified {
  tournamentId: UUID;
  participantId: UUID;
  status: TournamentEntryStatus;
  groupId?: UUID;
  seed?: number;
  metadata?: Record<string, unknown>;
}

export interface MatchParticipant {
  participantId: UUID;
  score?: number;
  result?: MatchResult;
  lineup?: UUID[];
}

export interface Match extends Identified {
  tournamentId: UUID;
  roundNumber: number;
  stage?: string;
  bestOf?: number;
  scheduledAt?: string;
  completedAt?: string;
  format?: TournamentFormat;
  participants: [MatchParticipant, MatchParticipant];
  metadata?: Record<string, unknown>;
}

export interface Group extends Identified {
  tournamentId: UUID;
  name: string;
  participants: UUID[];
  metadata?: Record<string, unknown>;
}

