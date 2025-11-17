import type { IdGenerator } from "../../shared/ports";
import type { ParticipantType, UUID } from "../../shared/types";
import type { PlayerRepository } from "../../players/domain/player.repository";
import type { TeamRepository } from "../../teams/domain/team.repository";
import type { Participant } from "../domain/participant";
import type { ParticipantRepository } from "../domain/participant.repository";

export class CreateParticipantUseCase {
  constructor(
    private readonly participants: ParticipantRepository,
    private readonly players: PlayerRepository,
    private readonly teams: TeamRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    type: ParticipantType;
    referenceId: UUID;
    displayName: string;
    countryCode?: string;
    seeding?: number;
    metadata?: Record<string, unknown>;
  }): Participant {
    if (input.type === "player" && !this.players.findById(input.referenceId)) {
      throw new Error("Player reference not found");
    }

    if (input.type === "team" && !this.teams.findById(input.referenceId)) {
      throw new Error("Team reference not found");
    }

    const participant: Participant = {
      id: this.ids.generate(),
      ...input,
    };

    return this.participants.create(participant);
  }
}

