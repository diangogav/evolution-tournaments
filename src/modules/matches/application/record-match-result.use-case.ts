import type { UUID, MatchResult } from "../../shared/types";
import type { MatchRepository } from "../domain/match.repository";
import type { TournamentRepository } from "../../tournaments/domain/tournament.repository";
import type { IdGenerator } from "../../shared/ports";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import type { Match } from "../domain/match";
import { CreateMatchUseCase } from "./create-match.use-case";

export class RecordMatchResultUseCase {
  constructor(
    private readonly matches: MatchRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator,
    private readonly createMatch: CreateMatchUseCase
  ) { }

  async execute(input: {
    matchId: UUID;
    participants: [
      { participantId: UUID; score: number },
      { participantId: UUID; score: number }
    ];
  }): Promise<Match> {
    const match = await this.matches.findById(input.matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (match.completedAt) {
      throw new Error("Match already completed");
    }

    const [p1, p2] = input.participants;

    // Actualizar scores
    match.updateParticipantScore(p1.participantId, p1.score);
    match.updateParticipantScore(p2.participantId, p2.score);

    // Determinar resultado
    let p1Result: MatchResult;
    let p2Result: MatchResult;
    let winnerId: UUID | null = null;

    if (p1.score > p2.score) {
      p1Result = "win";
      p2Result = "loss";
      winnerId = p1.participantId;
    } else if (p2.score > p1.score) {
      p1Result = "loss";
      p2Result = "win";
      winnerId = p2.participantId;
    } else {
      p1Result = "draw";
      p2Result = "draw";
    }

    match.setParticipantResult(p1.participantId, p1Result);
    match.setParticipantResult(p2.participantId, p2Result);

    match.markCompleted(new Date().toISOString());

    const updated = await this.matches.update(match);

    if (winnerId) {
      await this.advanceWinner(updated, winnerId);
    }

    return updated;
  }

  private async advanceWinner(currentMatch: Match, winnerId: UUID) {
    const tournament = await this.tournaments.findById(
      currentMatch.tournamentId
    );
    if (tournament?.format !== "SINGLE_ELIMINATION") {
      return;
    }

    const partnerMatch = await this.findPartnerMatch(currentMatch);
    if (!partnerMatch || partnerMatch.completedAt == null) {
      return;
    }

    const partnerWinner = partnerMatch.participants.find(
      (p) => p.result === "win"
    );
    if (!partnerWinner) {
      return;
    }

    const currentPosition = currentMatch.metadata?.position as number | undefined;
    if (!currentPosition) {
      return;
    }

    const nextRoundPosition = Math.ceil(currentPosition / 2);

    await this.createMatch.execute({
      tournamentId: currentMatch.tournamentId,
      roundNumber: currentMatch.roundNumber + 1,
      participants: [
        { participantId: winnerId },
        { participantId: partnerWinner.participantId },
      ],
      metadata: {
        position: nextRoundPosition,
      },
    });
  }

  private async findPartnerMatch(
    currentMatch: Match
  ): Promise<Match | undefined> {
    const currentPosition = currentMatch.metadata?.position as number | undefined;
    if (!currentPosition) {
      return undefined;
    }

    const partnerPosition =
      currentPosition % 2 === 0 ? currentPosition - 1 : currentPosition + 1;

    const allMatches = await this.matches.listByTournament(
      currentMatch.tournamentId
    );

    return allMatches.find(
      (m) =>
        m.roundNumber === currentMatch.roundNumber &&
        (m.metadata?.position as number | undefined) === partnerPosition
    );
  }
}
