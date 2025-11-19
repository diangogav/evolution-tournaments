import { Player, PlayerProps } from "../domain/player";
import type { IdGenerator } from "../../shared/ports";
import type { PlayerRepository } from "../domain/player.repository";

export class CreatePlayerUseCase {
  constructor(
    private readonly players: PlayerRepository,
    private readonly ids: IdGenerator
  ) {}

  async execute(input: {
    displayName: string;
    nickname?: string;
    birthDate?: string;
    countryCode?: string;
    contactEmail?: string;
    preferredDisciplines?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<PlayerProps> {
    if (!input.displayName || input.displayName.trim().length === 0) {
      throw new Error("Player.displayName cannot be empty");
    }

    const player = Player.create({
      id: this.ids.generate(),
      displayName: input.displayName,
      nickname: input.nickname ?? null,
      birthDate: input.birthDate ?? null,
      countryCode: input.countryCode ?? null,
      contactEmail: input.contactEmail ?? null,
      preferredDisciplines: input.preferredDisciplines ?? [],
      isActive: true,
      metadata: input.metadata ?? {},
    });

    const createdPlayer = await this.players.create(player);

    return createdPlayer.toPrimitives();
  }
}