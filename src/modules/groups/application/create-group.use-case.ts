import type { IdGenerator } from "../../shared/ports";
import type { UUID } from "../../shared/types";
import type { ParticipantRepository } from "../../participants/domain/participant.repository";
import type { TournamentRepository } from "../../tournaments/domain/tournament.repository";
import type { Group } from "../domain/group";
import type { GroupRepository } from "../domain/group.repository";

export class CreateGroupUseCase {
  constructor(
    private readonly groups: GroupRepository,
    private readonly tournaments: TournamentRepository,
    private readonly participants: ParticipantRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    tournamentId: UUID;
    name: string;
    participants: UUID[];
    metadata?: Record<string, unknown>;
  }): Group {
    const tournament = this.tournaments.findById(input.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    input.participants.forEach((participantId) => {
      if (!this.participants.findById(participantId)) {
        throw new Error(`Participant ${participantId} not found`);
      }
    });

    const group: Group = {
      id: this.ids.generate(),
      tournamentId: tournament.id,
      name: input.name,
      participants: input.participants,
      metadata: input.metadata,
    };

    return this.groups.create(group);
  }
}

