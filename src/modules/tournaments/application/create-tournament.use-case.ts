import type { IdGenerator } from "../../shared/ports";
import type {
  ParticipantType,
  TournamentFormat,
  TournamentStatus,
} from "../../shared/types";
import type { Tournament } from "../domain/tournament";
import type { TournamentRepository } from "../domain/tournament.repository";

export class CreateTournamentUseCase {
  constructor(
    private readonly tournaments: TournamentRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    name: string;
    description?: string;
    discipline: string;
    format: TournamentFormat;
    status: TournamentStatus;
    allowMixedParticipants?: boolean;
    participantType?: ParticipantType;
    maxParticipants?: number;
    startAt?: string;
    endAt?: string;
    location?: string;
    metadata?: Record<string, unknown>;
  }): Tournament {
    const allowMixed = input.allowMixedParticipants ?? false;
    if (!allowMixed && !input.participantType) {
      throw new Error(
        "participantType is required when mixed participants are disabled"
      );
    }

    const tournament: Tournament = {
      id: this.ids.generate(),
      name: input.name,
      description: input.description,
      discipline: input.discipline,
      format: input.format,
      status: input.status,
      allowMixedParticipants: allowMixed,
      participantType: input.participantType,
      maxParticipants: input.maxParticipants,
      startAt: input.startAt,
      endAt: input.endAt,
      location: input.location,
      metadata: input.metadata,
    };

    return this.tournaments.create(tournament);
  }
}

