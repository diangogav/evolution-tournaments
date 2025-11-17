import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { UUID } from "../../../../shared/types";
import type { TournamentEntry } from "../../../domain/tournament-entry";
import type { TournamentEntryRepository } from "../../../domain/tournament-entry.repository";

export class InMemoryTournamentEntryRepository
  implements TournamentEntryRepository
{
  constructor(private readonly db: InMemoryDatabase) {}

  async create(entry: TournamentEntry): Promise<TournamentEntry> {
    this.db.collections.entries.set(entry.id, entry);
    return entry;
  }

  async listByTournament(tournamentId: UUID): Promise<TournamentEntry[]> {
    return Array.from(this.db.collections.entries.values()).filter(
      (entry) => entry.tournamentId === tournamentId
    );
  }
}

