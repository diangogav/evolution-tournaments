import type { UUID } from "../../shared/types";
import type { MatchRepository } from "../domain/match.repository";
import type { MatchResult } from "../../shared/types";
import { TournamentRepository } from "../../tournaments/domain/tournament.repository";
import { CreateMatchUseCase } from "./create-match.use-case";
import { IdGenerator } from "../../shared/ports";
import { Match } from "../domain/match";
import { ParticipantRepository } from "../../participants/domain/participant.repository";

export class RecordMatchResultUseCase {
  private readonly createMatch: CreateMatchUseCase;

  constructor(
    private readonly matches: MatchRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator
  ) {
    this.createMatch = new CreateMatchUseCase(
      this.matches,
      this.tournaments,
      this.participants,
      this.ids
    );
  }

  async execute(input: {
    matchId: UUID;
    participants: [
      { participantId: UUID; score: number },
      { participantId: UUID; score: number }
    ];
  }): Promise<void> {
    const match = await this.matches.findById(input.matchId);

    if (!match) {
      throw new Error("Match not found");
    }

    if (match.completedAt) {
      throw new Error("Match already completed");
    }

    const [p1, p2] = input.participants;

    const matchParticipant1 = match.participants.find(
      (p) => p.participantId === p1.participantId
    );
    const matchParticipant2 = match.participants.find(
      (p) => p.participantId === p2.participantId
    );

    if (!matchParticipant1 || !matchParticipant2) {
      throw new Error("Participant not found in match");
    }

    matchParticipant1.score = p1.score;
    matchParticipant2.score = p2.score;

    let p1Result: MatchResult;
    let p2Result: MatchResult;
    let winnerId: UUID | undefined;

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

    matchParticipant1.result = p1Result;
    matchParticipant2.result = p2Result;

    match.completedAt = new Date().toISOString();

    await this.matches.update(match);

    if (winnerId) {
      await this.advanceWinner(match, winnerId);
    }
  }

  private async advanceWinner(currentMatch: Match, winnerId: UUID) {
    const tournament = await this.tournaments.findById(
      currentMatch.tournamentId
    );
    if (tournament?.format !== "SINGLE_ELIMINATION") {
      return;
    }

    const partnerMatch = await this.findPartnerMatch(currentMatch);
    if (!partnerMatch || !partnerMatch.completedAt) {
      return;
    }

    const partnerWinner = partnerMatch.participants.find(
      (p) => p.result === "win"
    );
    if (!partnerWinner) {
      return;
    }

    const currentPosition = currentMatch.metadata?.position as number;
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
    const currentPosition = currentMatch.metadata?.position as number;
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
        m.metadata?.position === partnerPosition
    );
  }
}

