import type { UUID } from "../../shared/types";
import type { Tournament } from "./tournament";

export interface TournamentRepository {
  create(tournament: Tournament): Tournament;
  list(): Tournament[];
  findById(id: UUID): Tournament | undefined;
}

