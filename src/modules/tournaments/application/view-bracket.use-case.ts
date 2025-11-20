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
    constructor(
        private readonly tournaments: TournamentRepository,
        private readonly matches: MatchRepository,
        private readonly participants: ParticipantRepository
    ) { }

    async execute(input: { tournamentId: string }): Promise<BracketView> {
        const tournament = await this.tournaments.findById(input.tournamentId);
        if (!tournament) throw new Error("Tournament not found");

        const matches = await this.matches.listByTournament(tournament.id);
        if (matches.length === 0) {
            return { tournamentId: tournament.id, rounds: [] };
        }

        // ---------------------------------------------------
        // 1) Preparar cache de participantes
        // ---------------------------------------------------
        const participantIds = this.collectParticipantIds(matches);
        const participantsCache = await this.loadParticipants(participantIds);

        // ---------------------------------------------------
        // 2) Agrupar matches por ronda
        // ---------------------------------------------------
        const rounds = this.groupMatchesByRound(matches, participantsCache);

        return {
            tournamentId: tournament.id,
            rounds
        };
    }

    // ======================================================
    // Helpers tipados
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
        const [p1, p2] = match.participants;

        return {
            id: match.id,
            roundNumber: match.roundNumber,
            position: match.metadata.position as number ?? 0,
            nextMatchId: match.metadata.nextMatchId as string ?? null,
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
// Tipos internos auxiliares — pero tipados
// ----------------------------------------------------------
interface ParticipantViewCache {
    id: string;
    displayName: string;
}
