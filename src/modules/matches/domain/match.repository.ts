import type { UUID } from "../../shared/types";
import type { Match } from "./match";

export interface MatchRepository {
  create(match: Match): Promise<Match>;
  list(): Promise<Match[]>;
  findById(id: UUID): Promise<Match | undefined>;
  update(match: Match): Promise<Match>;
}

