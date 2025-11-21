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
        const tournament = await this.loadTournament(input.tournamentId);
        this.validateTournamentState(tournament);

        const confirmed = await this.loadConfirmedEntries(tournament.id);
        this.validateParticipantsCount(confirmed);

        const rounds = Math.log2(confirmed.length);

        const round1Pairs = this.generateRound1Pairs(confirmed);
        const bracket = await this.buildBracket(tournament.id, rounds, round1Pairs);

        tournament.start();
        await this.tournaments.update(tournament);

        return { rounds: bracket };
    }

    // ------------------------------
    // LOADERS & VALIDATORS
    // ------------------------------

    private async loadTournament(id: UUID) {
        const t = await this.tournaments.findById(id);
        if (!t) throw new Error("Tournament not found");
        return t;
    }

    private validateTournamentState(tournament: any) {
        if (!tournament.canGenerateBracket()) {
            throw new Error("Cannot generate bracket. Tournament must be PUBLISHED.");
        }
    }

    private async loadConfirmedEntries(tournamentId: UUID) {
        return (await this.entries.listByTournament(tournamentId))
            .filter(e => e.status === "CONFIRMED")
            .sort((a, b) => (a.seed ?? Infinity) - (b.seed ?? Infinity));
    }

    private validateParticipantsCount(entries: TournamentEntry[]) {
        if (entries.length < 2)
            throw new Error("Not enough participants");

        const n = entries.length;
        if ((n & (n - 1)) !== 0)
            throw new Error("Participants count must be a power of 2");
    }

    // ------------------------------
    // BRACKET BUILDING
    // ------------------------------

    private async buildBracket(tournamentId: UUID, rounds: number, round1Pairs: TournamentEntry[][]) {
        const allRounds: string[][] = [];

        const round1Matches = await this.createRound1(tournamentId, round1Pairs);
        allRounds.push(round1Matches);

        let previousMatches = round1Matches;

        for (let r = 2; r <= rounds; r++) {
            const nextMatches = await this.createNextRound(tournamentId, r, previousMatches);
            allRounds.push(nextMatches);
            previousMatches = nextMatches;
        }

        return allRounds;
    }

    // ------------------------------
    // ROUND 1
    // ------------------------------

    private async createRound1(tournamentId: UUID, pairs: TournamentEntry[][]) {
        const roundMatchIds: string[] = [];

        for (let i = 0; i < pairs.length; i++) {
            const [p1, p2] = pairs[i];

            const match = await this.createMatch.execute({
                tournamentId,
                roundNumber: 1,
                participants: [
                    { participantId: p1.participantId, score: null, result: null },
                    { participantId: p2.participantId, score: null, result: null }
                ],
                metadata: { position: i + 1 }
            });

            roundMatchIds.push(match.id);
        }

        return roundMatchIds;
    }

    // ------------------------------
    // ROUNDS 2..N
    // ------------------------------

    private async createNextRound(tournamentId: UUID, roundNumber: number, prevRound: string[]) {
        const nextMatchIds: string[] = [];

        for (let i = 0; i < prevRound.length; i += 2) {
            const matchA = prevRound[i];
            const matchB = prevRound[i + 1];

            const match = await this.createMatch.execute({
                tournamentId,
                roundNumber,
                participants: [
                    { participantId: "TBD_" + matchA, score: null, result: null },
                    { participantId: "TBD_" + matchB, score: null, result: null }
                ],
                metadata: {
                    position: i / 2 + 1,
                    from: [matchA, matchB]
                }
            });

            nextMatchIds.push(match.id);

            await this.linkMatchesToNext(matchA, match.id);
            await this.linkMatchesToNext(matchB, match.id);
        }

        return nextMatchIds;
    }

    private async linkMatchesToNext(previousMatchId: string, nextMatchId: string) {
        const m = await this.matches.findById(previousMatchId);
        if (!m) return;

        const primitive = m.toPrimitives();
        primitive.metadata.nextMatchId = nextMatchId;

        await this.matches.update(m);
    }

    // ------------------------------
    // SEEDING ALGORITHM
    // ------------------------------

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
