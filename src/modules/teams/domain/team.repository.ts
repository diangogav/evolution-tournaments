import type { UUID } from "../../shared/types";
import type { Team } from "./team";

export interface TeamRepository {
  create(team: Team): Promise<Team>;
  list(): Promise<Team[]>;
  findById(id: UUID): Promise<Team | undefined>;
}

