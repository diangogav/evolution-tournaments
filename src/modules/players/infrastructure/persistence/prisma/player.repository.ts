import type { Player } from "../../../domain/player";
import type { PlayerRepository } from "../../../domain/player.repository";
import { PrismaClient } from "../../../../../generated/prisma";
import type { UUID } from "../../../../shared/types";

export class PrismaPlayerRepository implements PlayerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(player: Player): Promise<Player> {
    const newPlayer = await this.prisma.player.create({
      data: {
        id: player.id,
        displayName: player.displayName,
        nickname: player.nickname,
        birthDate: player.birthDate,
        countryCode: player.countryCode,
        contactEmail: player.contactEmail,
        preferredDisciplines: player.preferredDisciplines,
        isActive: player.isActive,
        metadata: player.metadata,
      },
    });

    return newPlayer as Player;
  }

  async list(): Promise<Player[]> {
    const players = await this.prisma.player.findMany();
    return players as Player[];
  }

  async findById(id: UUID): Promise<Player | null> {
    const player = await this.prisma.player.findUnique({
      where: { id },
    });

    if (!player) {
      return null;
    }

    return player as Player;
  }
}
