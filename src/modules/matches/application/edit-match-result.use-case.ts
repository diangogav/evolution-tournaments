import type { UUID } from "../../shared/types";
import type { MatchRepository } from "../domain/match.repository";
import type { MatchParticipant } from "../domain/match-participant";

export class EditMatchResult {
    constructor(private readonly repository: MatchRepository) { }

    async execute(matchId: UUID, participants: [MatchParticipant, MatchParticipant]): Promise<void> {
        const match = await this.repository.findById(matchId);

        if (!match) {
            throw new Error("Match not found");
        }

        match.editResult(participants);
        await this.repository.update(match);
    }
}
