import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { UUID } from "../../../../shared/types";
import type { Participant } from "../../domain/participant";
import type { ParticipantRepository } from "../../domain/participant.repository";

export class InMemoryParticipantRepository
  implements ParticipantRepository
{
  constructor(private readonly db: InMemoryDatabase) {}

  create(participant: Participant): Participant {
    this.db.collections.participants.set(participant.id, participant);
    return participant;
  }

  list(): Participant[] {
    return Array.from(this.db.collections.participants.values());
  }

  findById(id: UUID): Participant | undefined {
    return this.db.collections.participants.get(id);
  }
}

