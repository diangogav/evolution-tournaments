import type {
  Identified,
  TournamentEntryStatus,
  UUID,
} from "../../shared/types";

export interface TournamentEntry extends Identified {
  tournamentId: UUID;
  participantId: UUID;
  status: TournamentEntryStatus;
  groupId?: UUID;
  seed?: number;
  metadata?: Record<string, unknown>;
}

