import { Repository } from "typeorm";
import type { Participant } from "../../../domain/participant";
import type { ParticipantRepository } from "../../../domain/participant.repository";
import type { UUID } from "../../../../shared/types";
import { ParticipantEntity } from "../../../../../infrastructure/persistence/typeorm/entities/participant.entity";

export class TypeOrmParticipantRepository implements ParticipantRepository {
  constructor(private readonly repository: Repository<ParticipantEntity>) {}

  async create(participant: Participant): Promise<Participant> {
    const entity = this.repository.create(participant);
    await this.repository.save(entity);
    return entity;
  }

  async list(): Promise<Participant[]> {
    return await this.repository.find();
  }

  async findById(id: UUID): Promise<Participant | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }
}
