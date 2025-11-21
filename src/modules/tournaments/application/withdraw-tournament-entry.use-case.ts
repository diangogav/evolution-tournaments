import type { UUID } from "../../shared/types";
import type { TournamentEntryRepository } from "../domain/tournament-entry.repository";

export class WithdrawTournamentEntry {
    constructor(private readonly repository: TournamentEntryRepository) { }

    async execute(entryId: UUID): Promise<void> {
        const entry = await this.repository.findById(entryId);

        if (!entry) {
            throw new Error("Tournament entry not found");
        }

        entry.withdraw();
        await this.repository.save(entry);
    }
}
