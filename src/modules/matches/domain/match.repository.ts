import type { Match } from "./match";

export interface MatchRepository {
  create(match: Match): Match;
  list(): Match[];
}

