import type { IdGenerator } from "../../shared/ports";
import type { UUID } from "../../shared/types";
import type { MatchRepository } from "../../matches/domain/match.repository";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import type { TournamentEntryRepository } from "../domain/tournament-entry.repository";
import type { TournamentRepository } from "../domain/tournament.repository";
import { CreateMatchUseCase } from "../../matches/application/create-match.use-case";
import type { TournamentEntry } from "../domain/tournament-entry";

export class GenerateFullBracketUseCase {
    constructor(
        private readonly tournaments: TournamentRepository,
        private readonly entries: TournamentEntryRepository,
        private readonly matches: MatchRepository,
        private readonly participants: ParticipantRepository,
        private readonly ids: IdGenerator,
        private readonly createMatch: CreateMatchUseCase
    ) { }

    async execute(input: { tournamentId: UUID }) {
        const tournament = await this.tournaments.findById(input.tournamentId);
        if (!tournament) throw new Error("Tournament not found");

        // Validate tournament can generate bracket
        if (!tournament.canGenerateBracket()) {
            throw new Error("Cannot generate bracket. Tournament must be in PUBLISHED status.");
        }

        const confirmed = (await this.entries.listByTournament(tournament.id))
            .filter(e => e.status === "CONFIRMED")
            .sort((a, b) => (a.seed ?? Infinity) - (b.seed ?? Infinity));

        if (confirmed.length < 2)
            throw new Error("Not enough participants");

        const n = confirmed.length;
        if ((n & (n - 1)) !== 0)
            throw new Error("Participants count must be power of 2");

        const rounds = Math.log2(n);

        // Round 1 seeding (ya correcto en tu versión actual)
        const r1Pairs = this.generateRound1Pairs(confirmed);

        // Crear bracket completo
        const allMatches = [];
        const roundMatches: string[][] = [];

        // R1
        const r1MatchIds: string[] = [];

        for (let i = 0; i < r1Pairs.length; i++) {
            const p1 = r1Pairs[i][0];
            const p2 = r1Pairs[i][1];

            const match = await this.createMatch.execute({
                tournamentId: tournament.id,
                roundNumber: 1,
                participants: [
                    { participantId: p1.participantId, score: null, result: null },
                    { participantId: p2.participantId, score: null, result: null },
                ],
                metadata: { position: i + 1 }
            });

            allMatches.push(match);
            r1MatchIds.push(match.id);
        }

        roundMatches.push(r1MatchIds);

        // R2 → Rn
        let prevRound = r1MatchIds;

        for (let r = 2; r <= rounds; r++) {
            const nextRound: string[] = [];

            for (let i = 0; i < prevRound.length; i += 2) {
                const matchIdA = prevRound[i];
                const matchIdB = prevRound[i + 1];

                const newMatch = await this.createMatch.execute({
                    tournamentId: tournament.id,
                    roundNumber: r,
                    participants: [
                        { participantId: "TBD_" + matchIdA, score: null, result: null },
                        { participantId: "TBD_" + matchIdB, score: null, result: null },
                    ],
                    metadata: {
                        position: i / 2 + 1,
                        from: [matchIdA, matchIdB]
                    }
                });

                allMatches.push(newMatch);
                nextRound.push(newMatch.id);

                // Enlazar nextMatchId en los matches previos
                const updateA = await this.matches.findById(matchIdA);
                if (updateA) {
                    updateA.toPrimitives().metadata.nextMatchId = newMatch.id;
                    await this.matches.update(updateA);
                }

                const updateB = await this.matches.findById(matchIdB);
                if (updateB) {
                    updateB.toPrimitives().metadata.nextMatchId = newMatch.id;
                    await this.matches.update(updateB);
                }
            }

            roundMatches.push(nextRound);
            prevRound = nextRound;
        }

        // Auto-start tournament after generating bracket
        tournament.start();
        await this.tournaments.update(tournament);

        return {
            rounds: roundMatches,
        };
    }

    private generateRound1Pairs(entries: TournamentEntry[]) {
        const n = entries.length;
        const rounds = Math.log2(n);
        let seeds = [1];

        for (let i = 1; i < rounds; i++) {
            const next = [];
            for (const s of seeds) {
                next.push(s);
                next.push(2 ** i + 1 - s);
            }
            seeds = next;
        }

        const pairs = [];
        for (let i = 0; i < seeds.length; i++) {
            const s1 = seeds[i];
            const s2 = n - seeds[i] + 1;

            pairs.push([entries[s1 - 1], entries[s2 - 1]]);
        }

        return pairs;
    }
}
