import type { IdGenerator } from "../../shared/ports";
import type { TournamentEntryStatus, UUID } from "../../shared/types";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import type { TournamentEntry } from "../domain/tournament-entry";
import type { TournamentEntryRepository } from "../domain/tournament-entry.repository";
import type { TournamentRepository } from "../domain/tournament.repository";

export class RegisterTournamentEntryUseCase {
  constructor(
    private readonly entries: TournamentEntryRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator
  ) {}

  async execute(input: {
    tournamentId: UUID;
    participantId: UUID;
    status?: TournamentEntryStatus;
    groupId?: UUID;
    seed?: number;
    metadata?: Record<string, unknown>;
  }): Promise<TournamentEntry> {
    const tournament = await this.tournaments.findById(input.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const participant = await this.participants.findById(input.participantId);
    if (!participant) {
      throw new Error("Participant not found");
    }

    if (
      !tournament.allowMixedParticipants &&
      tournament.participantType !== participant.type
    ) {
      throw new Error("Participant type not allowed in tournament");
    }

    const entry: TournamentEntry = {
      id: this.ids.generate(),
      tournamentId: tournament.id,
      participantId: participant.id,
      status: input.status ?? "PENDING",
      groupId: input.groupId,
      seed: input.seed,
      metadata: input.metadata,
    };

    return this.entries.create(entry);
  }
}

