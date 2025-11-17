import type {
  Identified,
  TournamentFormat,
  UUID,
} from "../../shared/types";
import type { MatchParticipant } from "./match-participant";

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

