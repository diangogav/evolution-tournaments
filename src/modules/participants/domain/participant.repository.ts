import type { UUID } from "../../shared/types";
import type { Participant } from "./participant";

export interface ParticipantRepository {
  create(participant: Participant): Participant;
  list(): Participant[];
  findById(id: UUID): Participant | undefined;
}

