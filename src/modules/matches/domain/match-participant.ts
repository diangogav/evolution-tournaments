import type { MatchResult, UUID } from "../../shared/types";

export interface MatchParticipant {
  participantId: UUID;
  score: number | null;
  result: MatchResult | null;
  lineup?: UUID[];
}
