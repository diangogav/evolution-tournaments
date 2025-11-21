import type { IdGenerator } from "../../shared/ports";
import type { UUID } from "../../shared/types";
import type { MatchRepository } from "../../matches/domain/match.repository";
import type { TournamentEntryRepository } from "../domain/tournament-entry.repository";
import type { TournamentRepository } from "../domain/tournament.repository";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import type { TournamentEntry } from "../domain/tournament-entry";
import { CreateMatchUseCase } from "../../matches/application/create-match.use-case";

export class GenerateSingleEliminationBracketUseCase {
  constructor(
    private readonly tournaments: TournamentRepository,
    private readonly entries: TournamentEntryRepository,
    private readonly matches: MatchRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator,
    private readonly createMatch: CreateMatchUseCase
  ) { }

  async execute(input: { tournamentId: UUID }) {
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

    // Auto-start tournament after generating bracket
    tournament.start();
    await this.tournaments.update(tournament);

    return {
      bracket: bracketOrder,
      matches: createdMatches,
    };
  }

  private async ensureValidTournament(tournamentId: UUID) {
    const tournament = await this.tournaments.findById(tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    if (!tournament.canGenerateBracket()) {
      throw new Error("Cannot generate bracket. Tournament must be in PUBLISHED status.");
    }

    if (tournament.format !== "SINGLE_ELIMINATION") {
      throw new Error("Tournament format is not SINGLE_ELIMINATION");
    }

    return tournament;
  }

  private getSortedConfirmedParticipants(entries: TournamentEntry[]) {
    return entries
      .filter((e) => e.status === "CONFIRMED")
      .sort((a, b) => (a.seed ?? Infinity) - (b.seed ?? Infinity));
  }

  private ensureEnoughParticipants(confirmed: TournamentEntry[]) {
    if (confirmed.length < 2) {
      throw new Error("Not enough participants to generate a bracket");
    }
  }

  private ensurePowerOfTwo(n: number) {
    const isPowerOfTwo = (x: number) => (x & (x - 1)) === 0;
    if (!isPowerOfTwo(n)) {
      throw new Error("Number of participants must be a power of two");
    }
  }

  private generateBracketOrder(participants: TournamentEntry[]): TournamentEntry[] {
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

    const order: TournamentEntry[] = [];
    for (const seed of seeds) {
      const p1 = participants[seed - 1];
      const p2 = participants[n - seed];

      if (!p1 || !p2) {
        throw new Error("Invalid seeding order generated");
      }

      order.push(p1);
      order.push(p2);
    }

    return order;
  }

  private async createRoundOneMatches(params: {
    tournamentId: UUID;
    participants: TournamentEntry[];
  }) {
    const { tournamentId, participants } = params;

    const matches = [];
    const total = participants.length / 2;

    for (let i = 0; i < total; i++) {
      const p1 = participants[i * 2];
      const p2 = participants[i * 2 + 1];

      if (!p1 || !p2) {
        throw new Error("Bracket generation mismatch: missing participant");
      }

      const match = await this.createMatch.execute({
        tournamentId,
        roundNumber: 1,
        participants: [
          { participantId: p1.participantId, score: null, result: null },
          { participantId: p2.participantId, score: null, result: null },
        ],
        metadata: { position: i + 1 },
      });

      matches.push(match);
    }

    return matches;
  }
}
