import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { Group } from "../../domain/group";
import type { GroupRepository } from "../../domain/group.repository";

export class InMemoryGroupRepository implements GroupRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async create(group: Group): Promise<Group> {
    this.db.collections.groups.set(group.id, group);
    return group;
  }

  async list(): Promise<Group[]> {
    return Array.from(this.db.collections.groups.values());
  }
}

