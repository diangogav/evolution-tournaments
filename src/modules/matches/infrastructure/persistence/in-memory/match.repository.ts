import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { Match } from "../../domain/match";
import type { MatchRepository } from "../../domain/match.repository";

export class InMemoryMatchRepository implements MatchRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  create(match: Match): Match {
    this.db.collections.matches.set(match.id, match);
    return match;
  }

  list(): Match[] {
    return Array.from(this.db.collections.matches.values());
  }
}

