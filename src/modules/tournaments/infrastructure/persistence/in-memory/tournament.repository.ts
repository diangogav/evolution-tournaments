import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { UUID } from "../../../../shared/types";
import type { Tournament } from "../../../domain/tournament";
import type { TournamentRepository } from "../../../domain/tournament.repository";

export class InMemoryTournamentRepository implements TournamentRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async create(tournament: Tournament): Promise<Tournament> {
    this.db.collections.tournaments.set(tournament.id, tournament);
    return tournament;
  }

  async list(): Promise<Tournament[]> {
    return Array.from(this.db.collections.tournaments.values());
  }

  async findById(id: UUID): Promise<Tournament | undefined> {
    return this.db.collections.tournaments.get(id);
  }
}

