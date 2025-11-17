import type { Match } from "./match";

export interface MatchRepository {
  create(match: Match): Promise<Match>;
  list(): Promise<Match[]>;
}

