import type { PlayerRepository } from "../../../domain/player.repository";
import type { UUID } from "../../../../shared/types";
import { Player } from "../../../domain/player";
import { PrismaClient } from "@prisma/client";

export class PrismaPlayerRepository implements PlayerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(player: Player): Promise<Player> {
    const data = player.toPrimitives();
  
    const stored = await this.prisma.player.create({
      data: {
        ...data,
        metadata: JSON.parse(JSON.stringify(data.metadata)), // convierte a JSON-safe
      },
    });
  
    return Player.create({
      ...stored,
      metadata: stored.metadata ?? {},
    });
  }

  async list(): Promise<Player[]> {
    const players = await this.prisma.player.findMany();
    return players.map((player) => Player.create({
      ...player,
      metadata: {
        ...player.metadata as {}
      }
    }));
  }

  async findById(id: UUID): Promise<Player | null> {
    const player = await this.prisma.player.findUnique({
      where: { id },
    });

    return player ? Player.create({
      ...player,
      metadata: {
        ...player.metadata as {}
      }
    }) : null;
  }
}

