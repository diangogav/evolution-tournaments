import type { Identified, UUID } from "../../shared/types";

export interface Group extends Identified {
  tournamentId: UUID;
  name: string;
  participants: UUID[];
  metadata?: Record<string, unknown>;
}

