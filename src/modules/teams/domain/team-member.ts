import type { Identified, UUID } from "../../shared/types";

export interface TeamMember extends Identified {
  teamId: UUID;
  playerId: UUID;
  role?: string;
  isCaptain: boolean;
  joinedAt: string;
  leftAt?: string;
}

