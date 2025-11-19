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
    const tournament = await this.ensureValidTournament(input.tournamentId);
    const confirmed = this.getSortedConfirmedParticipants(
      await this.entries.listByTournament(tournament.id)
    );
    this.ensureEnoughParticipants(confirmed);
    this.ensurePowerOfTwo(confirmed.length);
    const bracketOrder = this.generateBracketOrder(confirmed);
    const createdMatches = await this.createRoundOneMatches({
      tournamentId: tournament.id,
      participants: bracketOrder,
    });
    console.log("Generated matches:", createdMatches);
  }

  private async ensureValidTournament(tournamentId: UUID) {
    const tournament = await this.tournaments.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    if (tournament.format !== "SINGLE_ELIMINATION") {
      throw new Error("Tournament format is not SINGLE_ELIMINATION");
    }

    return tournament;
  }

  private getSortedConfirmedParticipants(entries: any[]) {
    return entries
      .filter((e) => e.status === "CONFIRMED")
      .sort((a, b) => (a.seed ?? Infinity) - (b.seed ?? Infinity));
  }

  private ensureEnoughParticipants(confirmed: any[]) {
    if (confirmed.length < 2) {
      throw new Error("Not enough participants to generate a bracket");
    }
  }

  private ensurePowerOfTwo(n: number) {
    const isPowerOfTwo = (x: number) => (x & (x - 1)) === 0;
    if (!isPowerOfTwo(n)) {
      // Próxima versión → integrar BYES
      throw new Error("Number of participants must be a power of two");
    }
  }

  private generateBracketOrder<T extends { seed?: number }>(participants: T[]): T[] {
    const n = participants.length;
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

    const order: T[] = [];
    for (const seed of seeds) {
      order.push(participants[seed - 1]);
      order.push(participants[n - seed]);
    }

    return order;
  }

  private async createRoundOneMatches(params: {
    tournamentId: UUID;
    participants: Array<{ participantId: UUID }>;
  }) {
    const { tournamentId, participants } = params;

    const matches = [];
    const total = participants.length / 2;

    for (let i = 0; i < total; i++) {
      const p1 = participants[i * 2];
      const p2 = participants[i * 2 + 1];

      const match = await this.createMatch.execute({
        tournamentId,
        roundNumber: 1,
        participants: [
          { participantId: p1.participantId },
          { participantId: p2.participantId },
        ],
        metadata: { position: i + 1 },
      });

      matches.push(match);
    }

    return matches;
  }
}


