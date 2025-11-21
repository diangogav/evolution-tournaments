import type { UUID } from "../../shared/types";
import type { TournamentEntry } from "./tournament-entry";

export interface TournamentEntryRepository {
  create(entry: TournamentEntry): Promise<TournamentEntry>;
  listByTournament(tournamentId: UUID): Promise<TournamentEntry[]>;
  save(entry: TournamentEntry): Promise<void>;
  findById(id: UUID): Promise<TournamentEntry | null>;
}

