import { Repository } from "typeorm";
import type { Team } from "../../../domain/team";
import type { TeamRepository } from "../../../domain/team.repository";
import type { UUID } from "../../../../shared/types";
import { TeamEntity } from "../../../../../infrastructure/persistence/typeorm/entities/team.entity";

export class TypeOrmTeamRepository implements TeamRepository {
  constructor(private readonly repository: Repository<TeamEntity>) {}

  async create(team: Team): Promise<Team> {
    const entity = this.repository.create(team);
    await this.repository.save(entity);
    return entity;
  }

  async list(): Promise<Team[]> {
    return await this.repository.find();
  }

  async findById(id: UUID): Promise<Team | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }
}
