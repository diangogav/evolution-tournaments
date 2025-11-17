import type { IdGenerator } from "../../shared/ports";
import type { UUID } from "../../shared/types";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import type { TournamentRepository } from "../../tournaments/domain/tournament.repository";
import type { Match } from "../domain/match";
import type { MatchRepository } from "../domain/match.repository";

export class CreateMatchUseCase {
  constructor(
    private readonly matches: MatchRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    tournamentId: UUID;
    roundNumber: number;
    stage?: string;
    bestOf?: number;
    scheduledAt?: string;
    participants: [Match["participants"][0], Match["participants"][1]];
    metadata?: Record<string, unknown>;
  }): Match {
    const tournament = this.tournaments.findById(input.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    input.participants.forEach(({ participantId }) => {
      if (!this.participants.findById(participantId)) {
        throw new Error(`Participant ${participantId} not found`);
      }
    });

    const match: Match = {
      id: this.ids.generate(),
      tournamentId: tournament.id,
      roundNumber: input.roundNumber,
      stage: input.stage,
      bestOf: input.bestOf,
      scheduledAt: input.scheduledAt,
      completedAt: undefined,
      format: tournament.format,
      participants: input.participants,
      metadata: input.metadata,
    };

    return this.matches.create(match);
  }
}

