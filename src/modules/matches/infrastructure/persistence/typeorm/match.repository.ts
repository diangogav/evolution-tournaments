import { Repository } from "typeorm";
import type { Match } from "../../../domain/match";
import type { MatchRepository } from "../../../domain/match.repository";
import type { UUID } from "../../../../shared/types";
import { MatchEntity } from "../../../../../infrastructure/persistence/typeorm/entities/match.entity";

export class TypeOrmMatchRepository implements MatchRepository {
  constructor(private readonly repository: Repository<MatchEntity>) {}

  async create(match: Match): Promise<Match> {
    const entity = this.repository.create(match);
    await this.repository.save(entity);
    return entity;
  }

  async list(): Promise<Match[]> {
    return await this.repository.find();
  }
}
