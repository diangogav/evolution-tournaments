import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { UUID } from "../../../../shared/types";
import type { TournamentEntry } from "../../../domain/tournament-entry";
import type { TournamentEntryRepository } from "../../../domain/tournament-entry.repository";

export class InMemoryTournamentEntryRepository
  implements TournamentEntryRepository
{
  constructor(private readonly db: InMemoryDatabase) {}

  create(entry: TournamentEntry): TournamentEntry {
    this.db.collections.entries.set(entry.id, entry);
    return entry;
  }

  listByTournament(tournamentId: UUID): TournamentEntry[] {
    return Array.from(this.db.collections.entries.values()).filter(
      (entry) => entry.tournamentId === tournamentId
    );
  }
}

