import type { UUID } from "../../shared/types";
import type { Tournament } from "./tournament";

export interface TournamentRepository {
  create(tournament: Tournament): Promise<Tournament>;
  list(): Promise<Tournament[]>;
  findById(id: UUID): Promise<Tournament | undefined>;
}

