import { ParticipantType } from "@prisma/client";
import { PlayerRepository } from "../../players/domain/player.repository";
import { IdGenerator } from "../../shared/ports";
import { TeamRepository } from "../../teams/domain/team.repository";
import { Participant } from "../domain/participant";
import { ParticipantRepository } from "../domain/participant.repository";
import { UUID } from "../../shared/types";

export class CreateParticipantUseCase {
  constructor(
    private readonly participants: ParticipantRepository,
    private readonly players: PlayerRepository,
    private readonly teams: TeamRepository,
    private readonly ids: IdGenerator
  ) {}

  async execute(input: {
    type: ParticipantType;
    referenceId: UUID;
    displayName: string;
    countryCode?: string;
    seeding?: number;
    metadata?: Record<string, unknown>;
  }) {
    // reference validation
    if (input.type === "PLAYER") {
      const player = await this.players.findById(input.referenceId);
      if (!player) throw new Error("Player reference not found");
    }

    if (input.type === "TEAM") {
      const team = await this.teams.findById(input.referenceId);
      if (!team) throw new Error("Team reference not found");
    }

    const participant = Participant.create({
      id: this.ids.generate(),
      type: input.type,
      referenceId: input.referenceId,
      displayName: input.displayName,
      countryCode: input.countryCode ?? null,
      seeding: input.seeding ?? null,
      metadata: input.metadata ?? {},
    });

    return this.participants.create(participant);
  }
}
