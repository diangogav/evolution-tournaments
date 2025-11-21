import type { UUID } from "../../shared/types";
import type { TournamentRepository } from "../domain/tournament.repository";

export class CompleteTournamentUseCase {
    constructor(private readonly repository: TournamentRepository) { }

    async execute(tournamentId: UUID): Promise<void> {
        const tournament = await this.repository.findById(tournamentId);

        if (!tournament) {
            throw new Error("Tournament not found");
        }

        tournament.complete();
        await this.repository.update(tournament);
    }
}
