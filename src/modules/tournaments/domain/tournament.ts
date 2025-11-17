import type {
  Identified,
  ParticipantType,
  TournamentFormat,
  TournamentStatus,
} from "../../shared/types";

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

