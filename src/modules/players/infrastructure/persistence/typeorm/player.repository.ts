import { Repository } from "typeorm";
import type { Player } from "../../../domain/player";
import type { PlayerRepository } from "../../../domain/player.repository";
import type { UUID } from "../../../../shared/types";
import { PlayerEntity } from "../../../../../infrastructure/persistence/typeorm/entities/player.entity";

export class TypeOrmPlayerRepository implements PlayerRepository {
  constructor(private readonly repository: Repository<PlayerEntity>) {}

  async create(player: Player): Promise<Player> {
    const entity = this.repository.create(player);
    await this.repository.save(entity);
    return entity;
  }

  async list(): Promise<Player[]> {
    return await this.repository.find();
  }

  async findById(id: UUID): Promise<Player | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }
}
