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
    if (!match) throw new Error("Match not found");

    if (match.completedAt) {
      throw new Error("Match already completed");
    }

    // Validate tournament state
    const tournament = await this.tournaments.findById(match.tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    if (!tournament.canStartMatches()) {
      throw new Error("Cannot record match results. Tournament must be in STARTED status.");
    }

    const [p1, p2] = input.participants;

    match.updateParticipantScore(p1.participantId, p1.score);
    match.updateParticipantScore(p2.participantId, p2.score);

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

    const allMatches = await this.matches.listByTournament(
      currentMatch.tournamentId
    );

    const partnerMatch = await this.findPartnerMatch(currentMatch, allMatches);

    // If there is no partner match, it means this was the final match
    if (!partnerMatch) {
      // Double check if it's the final by checking if there are any matches in the next round
      // For single elimination, the final match has the highest round number
      const maxRound = Math.max(...allMatches.map(m => m.roundNumber));
      if (currentMatch.roundNumber === maxRound) {
        // This is the final match!
        // Auto-complete tournament
        tournament.complete();
        await this.tournaments.update(tournament);

        if (tournament.webhookUrl && winnerId) {
          this.triggerWebhook(tournament.webhookUrl, {
            tournamentId: tournament.id,
            winnerId, // Send participantId directly
            completedAt: new Date().toISOString(),
          });
        }
      }
      return;
    }

    if (!partnerMatch.completedAt) return;

    const partnerWinner = partnerMatch.participants.find(
      (p) => p.result === "win"
    );
    if (!partnerWinner) return;

    const currentPosition = currentMatch.metadata?.position as number | undefined;
    if (!currentPosition) return;

    const nextRound = currentMatch.roundNumber + 1;
    const nextPosition = Math.ceil(currentPosition / 2);

    const existingNextMatch = allMatches.find(
      (m) =>
        m.roundNumber === nextRound &&
        (m.metadata?.position as number | undefined) === nextPosition
    );

    if (existingNextMatch) {
      const updatedNextMatch = existingNextMatch.withParticipants([
        {
          participantId: winnerId,
          score: null,
          result: null,
        },
        {
          participantId: partnerWinner.participantId,
          score: null,
          result: null,
        },
      ]);

      await this.matches.update(updatedNextMatch);
      return;
    }

    await this.createMatch.execute({
      tournamentId: currentMatch.tournamentId,
      roundNumber: nextRound,
      participants: [
        {
          participantId: winnerId,
          score: null,
          result: null,
        },
        {
          participantId: partnerWinner.participantId,
          score: null,
          result: null,
        },
      ],
      metadata: {
        position: nextPosition,
      },
    });
  }

  private async triggerWebhook(url: string, data: unknown) {
    console.log(`[Webhook] Triggering webhook to ${url}`, data);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log(`[Webhook] Response status: ${response.status}`);
      if (!response.ok) {
        const text = await response.text();
        console.error(`[Webhook] Failed response: ${text}`);
      }
    } catch (error) {
      console.error("Failed to trigger webhook:", error);
      // Don't re-throw - webhook failures should not block match result recording
    }
  }

  private async findPartnerMatch(
    currentMatch: Match,
    allMatches: Match[]
  ): Promise<Match | undefined> {
    const currentPosition = currentMatch.metadata?.position as number | undefined;
    if (!currentPosition) return undefined;

    const partnerPosition =
      currentPosition % 2 === 0 ? currentPosition - 1 : currentPosition + 1;

    return allMatches.find(
      (m) =>
        m.roundNumber === currentMatch.roundNumber &&
        (m.metadata?.position as number | undefined) === partnerPosition
    );
  }
}
