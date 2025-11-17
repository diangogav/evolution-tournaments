import type { MatchResult, UUID } from "../../shared/types";

export interface MatchParticipant {
  participantId: UUID;
  score?: number;
  result?: MatchResult;
  lineup?: UUID[];
}

