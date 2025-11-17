import type { IdGenerator } from "../../shared/ports";
import type { Player } from "../domain/player";
import type { PlayerRepository } from "../domain/player.repository";

export class CreatePlayerUseCase {
  constructor(
    private readonly players: PlayerRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    displayName: string;
    nickname?: string;
    birthDate?: string;
    countryCode?: string;
    contactEmail?: string;
    preferredDisciplines?: string[];
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }): Player {
    const player: Player = {
      id: this.ids.generate(),
      displayName: input.displayName,
      nickname: input.nickname,
      birthDate: input.birthDate,
      countryCode: input.countryCode,
      contactEmail: input.contactEmail,
      preferredDisciplines: input.preferredDisciplines,
      isActive: input.isActive ?? true,
      metadata: input.metadata,
    };

    return this.players.create(player);
  }
}

