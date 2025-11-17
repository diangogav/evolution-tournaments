import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { Group } from "../../domain/group";
import type { GroupRepository } from "../../domain/group.repository";

export class InMemoryGroupRepository implements GroupRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  create(group: Group): Group {
    this.db.collections.groups.set(group.id, group);
    return group;
  }

  list(): Group[] {
    return Array.from(this.db.collections.groups.values());
  }
}

