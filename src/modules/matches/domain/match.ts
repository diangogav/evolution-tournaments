import type {
  Identified,
  TournamentFormat,
  UUID,
} from "../../shared/types";
import type { MatchParticipant } from "./match-participant";

export interface Match extends Identified {
  tournamentId: UUID;
  roundNumber: number;
  stage: string | null;
  bestOf: number | null;
  scheduledAt: string | null;
  completedAt: string | null;
  format: TournamentFormat | null;
  participants: MatchParticipant[];
  metadata?: {};
}

