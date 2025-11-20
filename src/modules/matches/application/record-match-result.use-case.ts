import type { UUID, MatchResult } from "../../shared/types";
import type { MatchRepository } from "../domain/match.repository";
import type { TournamentRepository } from "../../tournaments/domain/tournament.repository";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import type { IdGenerator } from "../../shared/ports";
import { CreateMatchUseCase } from "./create-match.use-case";
import { Match } from "../domain/match";

export class RecordMatchResultUseCase {
  constructor(
    private readonly matches: MatchRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator,
    private readonly createMatch: CreateMatchUseCase,
  ) { }

  async execute(input: {
    matchId: UUID;
    participants: [
      { participantId: UUID; score: number },
      { participantId: UUID; score: number }
    ];
  }): Promise<Match> {
    const match = await this.matches.findById(input.matchId);
    if (!match) throw new Error("Match not found");
    if (match.completedAt) throw new Error("Match already completed");

    const [p1, p2] = input.participants;

    // --- Domain logic ---
    const updated = this.buildUpdatedMatch(match, p1, p2);

    // Persist updated match
    const stored = await this.matches.update(updated);

    if (stored.metadata.position) {
      await this.advanceWinner(stored);
    }

    return stored;
  }

  private buildUpdatedMatch(
    match: Match,
    p1: { participantId: UUID; score: number },
    p2: { participantId: UUID; score: number }
  ): Match {
    const now = new Date().toISOString();

    const winner =
      p1.score > p2.score ? p1.participantId :
        p2.score > p1.score ? p2.participantId :
          null;

    return Match.create({
      ...match.toPrimitives(),
      participants: [
        {
          participantId: p1.participantId,
          score: p1.score,
          result: winner === p1.participantId ? "win" : winner ? "loss" : "draw"
        },
        {
          participantId: p2.participantId,
          score: p2.score,
          result: winner === p2.participantId ? "win" : winner ? "loss" : "draw"
        }
      ],
      completedAt: now
    });
  }

  private async advanceWinner(match: Match) {
    const winner = match.participants.find(p => p.result === "win");
    if (!winner) return;

    const tournament = await this.tournaments.findById(match.tournamentId);
    if (tournament?.format !== "SINGLE_ELIMINATION") return;

    const all = await this.matches.listByTournament(match.tournamentId);
    const partner = await this.findPartnerMatch(all, match);
    if (!partner || !partner.completedAt) return;

    const partnerWinner = partner.participants.find(p => p.result === "win");
    if (!partnerWinner) return;

    const nextRound = match.roundNumber + 1;
    const position = match.metadata.position as number;
    const nextPosition = Math.ceil(position / 2);

    const existing = all.find(
      m => m.roundNumber === nextRound &&
        m.metadata.position === nextPosition
    );

    const participants = [
      { participantId: winner.participantId, score: null, result: null },
      { participantId: partnerWinner.participantId, score: null, result: null }
    ];

    if (existing) {
      const updated = Match.create({
        ...existing.toPrimitives(),
        participants
      });
      await this.matches.update(updated);
      return;
    }

    await this.createMatch.execute({
      tournamentId: match.tournamentId,
      roundNumber: nextRound,
      participants,
      metadata: { position: nextPosition }
    });
  }

  private findPartnerMatch(all: Match[], current: Match): Match | undefined {
    const position = current.metadata.position as number;
    const partnerPos = position % 2 === 0 ? position - 1 : position + 1;

    return all.find(
      m =>
        m.roundNumber === current.roundNumber &&
        m.metadata.position === partnerPos
    );
  }
}
