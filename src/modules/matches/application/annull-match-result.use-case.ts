import type { UUID } from "../../shared/types";
import type { MatchRepository } from "../domain/match.repository";

export class AnnullMatchResult {
    constructor(private readonly repository: MatchRepository) { }

    async execute(matchId: UUID): Promise<void> {
        const match = await this.repository.findById(matchId);

        if (!match) {
            throw new Error("Match not found");
        }

        match.annullResult();
        await this.repository.update(match);
    }
}
