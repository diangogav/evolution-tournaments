import type { UUID } from "../../shared/types";
import type { TournamentEntryRepository } from "../domain/tournament-entry.repository";
import type { TournamentRepository } from "../domain/tournament.repository";

export class WithdrawTournamentEntry {
    constructor(
        private readonly entryRepository: TournamentEntryRepository,
        private readonly tournamentRepository: TournamentRepository
    ) { }

    async execute(participantId: UUID, tournamentId: UUID): Promise<void> {
        const tournament = await this.tournamentRepository.findById(tournamentId);

        if (!tournament) {
            throw new Error("Tournament not found");
        }

        if (!tournament.canWithdraw()) {
            throw new Error("Cannot withdraw from tournament. Tournament must be in PUBLISHED status.");
        }

        const entry = await this.entryRepository.findByTournamentAndParticipant(tournamentId, participantId);

        if (!entry) {
            throw new Error("Tournament entry not found");
        }

        console.log(`[WithdrawTournamentEntry] Found entry: ${entry.id}, status: ${entry.status}, tournamentId: ${entry.tournamentId}`);

        entry.withdraw();
        await this.entryRepository.save(entry);
    }
}
