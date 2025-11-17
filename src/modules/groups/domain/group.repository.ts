import type { Group } from "./group";

export interface GroupRepository {
  create(group: Group): Group;
  list(): Group[];
}

