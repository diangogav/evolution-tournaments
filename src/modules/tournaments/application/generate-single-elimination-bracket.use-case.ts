import type { IdGenerator } from "../../shared/ports";
import type { UUID } from "../../shared/types";
import type { MatchRepository } from "../../matches/domain/match.repository";
import type { TournamentEntryRepository } from "../domain/tournament-entry.repository";
import type { TournamentRepository } from "../domain/tournament.repository";
import { CreateMatchUseCase } from "../../matches/application/create-match.use-case";
import { ParticipantRepository } from "../../participants/domain/participant.repository";

export class GenerateSingleEliminationBracketUseCase {
  private readonly createMatch: CreateMatchUseCase;

  constructor(
    private readonly tournaments: TournamentRepository,
    private readonly entries: TournamentEntryRepository,
    private readonly matches: MatchRepository,
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

  async execute(input: { tournamentId: UUID }): Promise<void> {
    const tournament = await this.tournaments.findById(input.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.format !== "SINGLE_ELIMINATION") {
      throw new Error("Tournament format is not SINGLE_ELIMINATION");
    }

    const entries = await this.entries.listByTournament(input.tournamentId);
    const participants = entries
      .filter((e) => e.status === "CONFIRMED")
      .sort((a, b) => (a.seed ?? Infinity) - (b.seed ?? Infinity));

    if (participants.length < 2) {
      throw new Error("Not enough participants to generate a bracket");
    }

    // For simplicity, we'll start with powers of 2
    const isPowerOfTwo = (n: number) => (n & (n - 1)) === 0;
    if (!isPowerOfTwo(participants.length)) {
      // TODO: Handle byes for non-power-of-two participants
      throw new Error("Number of participants must be a power of two");
    }

    const round1Matches = [];
    for (let i = 0; i < participants.length / 2; i++) {
      const participant1 = participants[i];
      const participant2 = participants[participants.length - 1 - i];

      const match = await this.createMatch.execute({
        tournamentId: tournament.id,
        roundNumber: 1,
        participants: [
          { participantId: participant1.participantId },
          { participantId: participant2.participantId },
        ],
      });
      round1Matches.push(match);
    }

    // In a real scenario, we would save the matches
    console.log("Generated matches:", round1Matches);
  }
}
