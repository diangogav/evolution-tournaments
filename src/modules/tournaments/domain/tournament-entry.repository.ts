import type { UUID } from "../../shared/types";
import type { TournamentEntry } from "./tournament-entry";

export interface TournamentEntryRepository {
  create(entry: TournamentEntry): TournamentEntry;
  listByTournament(tournamentId: UUID): TournamentEntry[];
}

