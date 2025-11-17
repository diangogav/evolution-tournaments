import { Repository } from "typeorm";
import type { Tournament } from "../../../domain/tournament";
import type { TournamentRepository } from "../../../domain/tournament.repository";
import type { UUID } from "../../../../shared/types";
import { TournamentEntity } from "../../../../../infrastructure/persistence/typeorm/entities/tournament.entity";

export class TypeOrmTournamentRepository implements TournamentRepository {
  constructor(private readonly repository: Repository<TournamentEntity>) {}

  async create(tournament: Tournament): Promise<Tournament> {
    const entity = this.repository.create(tournament);
    await this.repository.save(entity);
    return entity;
  }

  async list(): Promise<Tournament[]> {
    return await this.repository.find();
  }

  async findById(id: UUID): Promise<Tournament | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }
}
