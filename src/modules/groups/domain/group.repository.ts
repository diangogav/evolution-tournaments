import type { Group } from "./group";

export interface GroupRepository {
  create(group: Group): Promise<Group>;
  list(): Promise<Group[]>;
}

