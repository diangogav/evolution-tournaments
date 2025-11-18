import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { UUID } from "../../../../shared/types";
import type { Participant } from "../../../domain/participant";
import type { ParticipantRepository } from "../../../domain/participant.repository";

export class InMemoryParticipantRepository
  implements ParticipantRepository
{
  constructor(private readonly db: InMemoryDatabase) {}

  async create(participant: Participant): Promise<Participant> {
    this.db.collections.participants.set(participant.id, participant);
    return participant;
  }

  async list(): Promise<Participant[]> {
    return Array.from(this.db.collections.participants.values());
  }

  async findById(id: UUID): Promise<Participant | null> {
    return this.db.collections.participants.get(id) ?? null;
  }
}

