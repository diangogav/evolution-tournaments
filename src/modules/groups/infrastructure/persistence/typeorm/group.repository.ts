import { Repository } from "typeorm";
import type { Group } from "../../../domain/group";
import type { GroupRepository } from "../../../domain/group.repository";
import type { UUID } from "../../../../shared/types";
import { GroupEntity } from "../../../../../infrastructure/persistence/typeorm/entities/group.entity";

export class TypeOrmGroupRepository implements GroupRepository {
  constructor(private readonly repository: Repository<GroupEntity>) {}

  async create(group: Group): Promise<Group> {
    const entity = this.repository.create(group);
    await this.repository.save(entity);
    return entity;
  }

  async list(): Promise<Group[]> {
    return await this.repository.find();
  }
}
