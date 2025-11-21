import type { UUID } from "../../shared/types";
import type { TournamentEntryRepository } from "../domain/tournament-entry.repository";

export class ConfirmTournamentEntryUseCase {
    constructor(private readonly repository: TournamentEntryRepository) { }

    async execute(participantId: UUID, tournamentId: UUID): Promise<void> {
        const entry = await this.repository.findByTournamentAndParticipant(tournamentId, participantId);

        if (!entry) {
            throw new Error("Tournament entry not found");
        }

        entry.confirm();
        await this.repository.save(entry);
    }
}
