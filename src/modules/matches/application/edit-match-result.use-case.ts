import type { UUID } from "../../shared/types";
import type { MatchRepository } from "../domain/match.repository";
import type { MatchParticipant } from "../domain/match-participant";

export class EditMatchResult {
    constructor(private readonly repository: MatchRepository) { }

    async execute(matchId: UUID, participants: [MatchParticipant, MatchParticipant]): Promise<void> {
        console.log(`[EditMatchResult] Executing for match ${matchId}`);
        const match = await this.repository.findById(matchId);

        if (!match) {
            console.error(`[EditMatchResult] Match not found: ${matchId}`);
            throw new Error("Match not found");
        }

        console.log(`[EditMatchResult] Found match. Editing result...`);
        match.editResult(participants);

        console.log(`[EditMatchResult] Updating repository...`);
        await this.repository.update(match);
        console.log(`[EditMatchResult] Success`);
    }
}
