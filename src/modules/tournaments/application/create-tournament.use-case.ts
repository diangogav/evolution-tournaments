import type { IdGenerator } from "../../shared/ports";
import type {
  ParticipantType,
  TournamentFormat,
  TournamentStatus,
} from "../../shared/types";
import { Tournament } from "../domain/tournament";
import type { TournamentRepository } from "../domain/tournament.repository";

export class CreateTournamentUseCase {
  constructor(
    private readonly tournaments: TournamentRepository,
    private readonly ids: IdGenerator
  ) { }

  async execute(input: {
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
  }): Promise<Tournament> {
    const tournament = Tournament.create({
      id: this.ids.generate(),
      name: input.name,
      description: input.description ?? null,
      discipline: input.discipline,
      format: input.format,
      status: input.status,
      allowMixedParticipants: input.allowMixedParticipants ?? false,
      participantType: input.participantType ?? null,
      maxParticipants: input.maxParticipants ?? null,
      startAt: input.startAt ?? null,
      endAt: input.endAt ?? null,
      location: input.location ?? null,
      metadata: input.metadata ?? {},
    });

    return this.tournaments.create(tournament);
  }
}
