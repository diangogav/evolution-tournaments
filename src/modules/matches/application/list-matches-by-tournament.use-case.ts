import type { UUID } from "../../shared/types";
import type { Match } from "../domain/match";
import type { MatchRepository } from "../domain/match.repository";
import type { TournamentRepository } from "../../tournaments/domain/tournament.repository";

export class ListMatchesByTournamentUseCase {
    constructor(
        private readonly matches: MatchRepository,
        private readonly tournaments: TournamentRepository
    ) { }

    async execute(input: { tournamentId: UUID }): Promise<Match[]> {
        const tournament = await this.tournaments.findById(input.tournamentId);
        if (!tournament) {
            throw new Error("Tournament not found");
        }

        const matches = await this.matches.listByTournament(input.tournamentId);

        return matches
    }
}
