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

    const bracketParticipants = this.sortParticipantsForBracket(participants);

    const round1Matches = [];
    for (let i = 0; i < bracketParticipants.length / 2; i++) {
      const participant1 = bracketParticipants[i * 2];
      const participant2 = bracketParticipants[i * 2 + 1];

      const match = await this.createMatch.execute({
        tournamentId: tournament.id,
        roundNumber: 1,
        participants: [
          { participantId: participant1.participantId },
          { participantId: participant2.participantId },
        ],
        metadata: {
          position: i + 1,
        },
      });
      round1Matches.push(match);
    }

    // In a real scenario, we would save the matches
    console.log("Generated matches:", round1Matches);
  }

  private sortParticipantsForBracket<T extends { seed?: number }>(
    participants: T[]
  ): T[] {
    const n = participants.length;
    let seeds = [1];
    for (let i = 1; i < Math.log2(n); i++) {
      const nextSeeds = [];
      for (const seed of seeds) {
        nextSeeds.push(seed);
        nextSeeds.push(2 ** i + 1 - seed);
      }
      seeds = nextSeeds;
    }

    const bracketOrder: T[] = [];
    for (const seed of seeds) {
      bracketOrder.push(participants[seed - 1]);
      bracketOrder.push(participants[n - seed]);
    }

    return bracketOrder;
  }
}


