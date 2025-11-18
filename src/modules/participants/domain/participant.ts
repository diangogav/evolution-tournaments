import type {
  Identified,
  ParticipantType,
  UUID,
} from "../../shared/types";

export interface Participant extends Identified {
  type: ParticipantType;
  referenceId: UUID;
  displayName: string;
  countryCode?: string | null;
  seeding?: number | null;
  metadata?: {};
}

