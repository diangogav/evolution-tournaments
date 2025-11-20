import type { IdGenerator } from "../../shared/ports";
import type { UUID } from "../../shared/types";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import type { TournamentRepository } from "../../tournaments/domain/tournament.repository";
import { Match } from "../domain/match";
import type { MatchRepository } from "../domain/match.repository";
import { MatchParticipant } from "../domain/match-participant";

export class CreateMatchUseCase {
  constructor(
    private readonly matches: MatchRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator
  ) { }

  async execute(input: {
    tournamentId: UUID;
    roundNumber: number;
    stage?: string;
    bestOf?: number;
    scheduledAt?: string;
    participants: MatchParticipant[];
    metadata?: Record<string, unknown>;
  }): Promise<Match> {
    const tournament = await this.tournaments.findById(input.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const [p1, p2] = input.participants;

    if (p1.participantId === p2.participantId) {
      throw new Error("Match participants must be different");
    }

    // validar existencia de los participantes en BD
    const [participant1, participant2] = await Promise.all([
      this.participants.findById(p1.participantId),
      this.participants.findById(p2.participantId),
    ]);

    // if (!participant1 || !participant2) {
    //   throw new Error("One or more participants do not exist");
    // }

    const match = Match.create({
      id: this.ids.generate(),
      tournamentId: tournament.id,
      roundNumber: input.roundNumber,
      stage: input.stage ?? null,
      bestOf: input.bestOf ?? null,
      scheduledAt: input.scheduledAt ?? null,
      completedAt: null,
      format: tournament.format,
      participants: [
        { participantId: p1.participantId, score: null, result: null },
        { participantId: p2.participantId, score: null, result: null },
      ],
      metadata: input.metadata ?? {},
    });

    return this.matches.create(match);
  }
}
