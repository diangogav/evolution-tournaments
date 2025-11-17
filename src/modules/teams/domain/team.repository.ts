import type { UUID } from "../../shared/types";
import type { Team } from "./team";

export interface TeamRepository {
  create(team: Team): Team;
  list(): Team[];
  findById(id: UUID): Team | undefined;
}

