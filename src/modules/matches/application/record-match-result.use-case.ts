import type { UUID } from "../../shared/types";
import type { MatchRepository } from "../domain/match.repository";
import type { MatchResult } from "../../shared/types";

export class RecordMatchResultUseCase {
  constructor(private readonly matches: MatchRepository) {}

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

    if (p1.score > p2.score) {
      p1Result = "win";
      p2Result = "loss";
    } else if (p2.score > p1.score) {
      p1Result = "loss";
      p2Result = "win";
    } else {
      p1Result = "draw";
      p2Result = "draw";
    }

    matchParticipant1.result = p1Result;
    matchParticipant2.result = p2Result;

    match.completedAt = new Date().toISOString();

    await this.matches.update(match);
  }
}
