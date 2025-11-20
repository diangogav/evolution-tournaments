import type { MatchRepository } from "../../matches/domain/match.repository";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import type { TournamentRepository } from "../domain/tournament.repository";
import type { BracketView } from "../domain/bracket.dto";

export class BracketViewUseCase {
    constructor(
        private readonly tournaments: TournamentRepository,
        private readonly matches: MatchRepository,
        private readonly participants: ParticipantRepository
    ) { }

    async execute(input: { tournamentId: string }): Promise<BracketView> {
        const tournament = await this.tournaments.findById(input.tournamentId);
        if (!tournament) throw new Error("Tournament not found");

        const matches = await this.matches.listByTournament(tournament.id);

        const roundsMap = new Map<number, any[]>();

        for (const match of matches) {
            if (!roundsMap.has(match.roundNumber))
                roundsMap.set(match.roundNumber, []);
            roundsMap.get(match.roundNumber)!.push(match);
        }

        const rounds = [...roundsMap.entries()]
            .sort(([a], [b]) => a - b)
            .map(([round, matches]) => ({
                roundNumber: round,
                matches: matches
                    .sort((a, b) => (a.metadata.position ?? 0) - (b.metadata.position ?? 0))
                    .map(m => ({
                        id: m.id,
                        roundNumber: m.roundNumber,
                        position: m.metadata.position ?? 0,
                        nextMatchId: m.metadata.nextMatchId ?? null,
                        participant1: m.participants[0].participantId.startsWith("TBD") ? undefined : {
                            id: m.participants[0].participantId,
                            displayName: m.participants[0].participantId,
                            score: m.participants[0].score ?? null
                        },
                        participant2: m.participants[1].participantId.startsWith("TBD") ? undefined : {
                            id: m.participants[1].participantId,
                            displayName: m.participants[1].participantId,
                            score: m.participants[1].score ?? null
                        },
                        winnerId: m.participants.find(p => p.result === "win")?.participantId ?? null
                    }))
            }));

        return {
            tournamentId: tournament.id,
            rounds
        };
    }
}
