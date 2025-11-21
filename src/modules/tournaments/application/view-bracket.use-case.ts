import type { MatchRepository } from "../../matches/domain/match.repository";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import type { TournamentRepository } from "../domain/tournament.repository";

import type {
    BracketView,
    BracketRoundView,
    BracketMatchView,
    BracketParticipantView
} from "../domain/bracket.dto";

import type { Match } from "../../matches/domain/match";
import type { MatchParticipant } from "../../matches/domain/match-participant";

export class BracketViewUseCase {
    private matchesCache?: Map<string, Match>;

    constructor(
        private readonly tournaments: TournamentRepository,
        private readonly matches: MatchRepository,
        private readonly participants: ParticipantRepository
    ) { }

    async execute(input: { tournamentId: string }): Promise<BracketView> {
        const tournament = await this.tournaments.findById(input.tournamentId);
        if (!tournament) throw new Error("Tournament not found");

        const matchList = await this.matches.listByTournament(tournament.id);
        if (matchList.length === 0) {
            return { tournamentId: tournament.id, rounds: [] };
        }

        // Cache de matches para resolver from/next
        this.matchesCache = new Map(matchList.map(m => [m.id, m]));

        // Cache de participantes reales
        const participantIds = this.collectParticipantIds(matchList);
        const participantsCache = await this.loadParticipants(participantIds);

        // Agrupar por rondas
        const rounds = this.groupMatchesByRound(matchList, participantsCache);

        return {
            tournamentId: tournament.id,
            rounds
        };
    }

    // ======================================================
    // Helpers
    // ======================================================

    private collectParticipantIds(matches: Match[]): string[] {
        const ids = new Set<string>();

        for (const match of matches) {
            for (const p of match.participants) {
                if (!p.participantId.startsWith("TBD")) {
                    ids.add(p.participantId);
                }
            }
        }
        return [...ids];
    }

    private async loadParticipants(ids: string[]): Promise<Map<string, ParticipantViewCache>> {
        const map = new Map<string, ParticipantViewCache>();

        const loaded = await Promise.all(
            ids.map((id) => this.participants.findById(id))
        );

        for (const p of loaded) {
            if (p) {
                map.set(p.id, {
                    id: p.id,
                    displayName: p.displayName
                });
            }
        }

        return map;
    }

    private groupMatchesByRound(
        matches: Match[],
        participantsCache: Map<string, ParticipantViewCache>
    ): BracketRoundView[] {

        const roundsMap = new Map<number, Match[]>();

        for (const match of matches) {
            if (!roundsMap.has(match.roundNumber)) {
                roundsMap.set(match.roundNumber, []);
            }
            roundsMap.get(match.roundNumber)!.push(match);
        }

        return [...roundsMap.entries()]
            .sort(([a], [b]) => a - b)
            .map(([roundNumber, group]) => ({
                roundNumber,
                matches: group
                    .sort((a, b) =>
                        (a.metadata.position as number ?? 0) - (b.metadata.position as number ?? 0)
                    )
                    .map(m => this.toMatchView(m, participantsCache))
            }));
    }

    private toMatchView(
        match: Match,
        participantsCache: Map<string, ParticipantViewCache>
    ): BracketMatchView {

        const round = match.roundNumber;
        const position = (match.metadata.position as number) ?? 0;

        // Ej: R2-P3
        const slotId = `R${round}-P${position}`;

        // Resolver FROM (los matches que alimentan a este)
        const fromMatches = (match.metadata.from as string[] | undefined) ?? [];
        const from = fromMatches
            .map((matchId) => {
                const prev = this.matchesCache!.get(matchId);
                if (!prev) return null;

                return {
                    round: prev.roundNumber,
                    position: (prev.metadata.position as number) ?? 0
                };
            })
            .filter(Boolean) as { round: number; position: number }[];

        // Resolver NEXT (a dónde alimenta este)
        let next: { round: number; position: number } | null = null;
        const nextId = match.metadata.nextMatchId as string | undefined;
        if (nextId) {
            const nextMatch = this.matchesCache!.get(nextId);
            if (nextMatch) {
                next = {
                    round: nextMatch.roundNumber,
                    position: (nextMatch.metadata.position as number) ?? 0
                };
            }
        }

        const [p1, p2] = match.participants;

        return {
            id: match.id,
            roundNumber: match.roundNumber,
            position,
            slotId,

            nextMatchId: nextId ?? null,
            next,
            from,

            participant1: this.resolveParticipant(p1, participantsCache),
            participant2: this.resolveParticipant(p2, participantsCache),

            winnerId:
                match.participants.find((p) => p.result === "win")
                    ?.participantId ?? null
        };
    }

    private resolveParticipant(
        participant: MatchParticipant,
        participantsCache: Map<string, ParticipantViewCache>
    ): BracketParticipantView | undefined {

        if (participant.participantId.startsWith("TBD")) return undefined;

        const cached = participantsCache.get(participant.participantId);
        if (!cached) return undefined;

        return {
            id: cached.id,
            displayName: cached.displayName,
            score: participant.score ?? null
        };
    }
}

// ----------------------------------------------------------
// Tipos internos auxiliares
// ----------------------------------------------------------
interface ParticipantViewCache {
    id: string;
    displayName: string;
}
