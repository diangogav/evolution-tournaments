import type { IdGenerator } from "../../shared/ports";
import type { TournamentEntryStatus, UUID } from "../../shared/types";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import { TournamentEntry } from "../domain/tournament-entry";
import type { TournamentEntryRepository } from "../domain/tournament-entry.repository";
import type { TournamentRepository } from "../domain/tournament.repository";

export class RegisterTournamentEntryUseCase {
  constructor(
    private readonly entries: TournamentEntryRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator
  ) { }

  async execute(input: {
    tournamentId: UUID;
    participantId: UUID;
    status?: TournamentEntryStatus;
    groupId?: UUID;
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

    const existingEntries = await this.entries.listByTournament(
      input.tournamentId
    );

    // evitar duplicados
    if (existingEntries.some((e) => e.participantId === participant.id)) {
      throw new Error("Participant already registered in this tournament");
    }

    // validar maxParticipants
    if (
      tournament.maxParticipants &&
      existingEntries.length >= tournament.maxParticipants
    ) {
      throw new Error("Tournament is full");
    }

    const maxSeed = existingEntries.reduce(
      (max, entry) => (entry.seed && entry.seed > max ? entry.seed : max),
      0
    );
    const nextSeed = maxSeed + 1;

    const entry = TournamentEntry.create({
      id: this.ids.generate(),
      tournamentId: tournament.id,
      participantId: participant.id,
      status: input.status ?? "PENDING",
      groupId: input.groupId ?? null,
      seed: nextSeed,
      metadata: input.metadata ?? {},
    });

    return this.entries.create(entry);
  }
}
