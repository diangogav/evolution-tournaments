import type { UUID } from "../../shared/types";
import type { Participant } from "./participant";

export interface ParticipantRepository {
  create(participant: Participant): Promise<Participant>;
  list(): Promise<Participant[]>;
  findById(id: UUID): Promise<Participant | null>;
}

