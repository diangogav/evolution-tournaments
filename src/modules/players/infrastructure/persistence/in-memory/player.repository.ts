import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { UUID } from "../../../../shared/types";
import type { Player } from "../../domain/player";
import type { PlayerRepository } from "../../domain/player.repository";

export class InMemoryPlayerRepository implements PlayerRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async create(player: Player): Promise<Player> {
    this.db.collections.players.set(player.id, player);
    return player;
  }

  async list(): Promise<Player[]> {
    return Array.from(this.db.collections.players.values());
  }

  async findById(id: UUID): Promise<Player | undefined> {
    return this.db.collections.players.get(id);
  }
}

