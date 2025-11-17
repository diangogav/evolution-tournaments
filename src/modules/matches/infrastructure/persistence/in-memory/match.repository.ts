import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { Match } from "../../domain/match";
import type { MatchRepository } from "../../domain/match.repository";

export class InMemoryMatchRepository implements MatchRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async create(match: Match): Promise<Match> {
    this.db.collections.matches.set(match.id, match);
    return match;
  }

  async list(): Promise<Match[]> {
    return Array.from(this.db.collections.matches.values());
  }
}

