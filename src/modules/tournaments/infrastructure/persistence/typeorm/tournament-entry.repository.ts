import { Repository } from "typeorm";
import type { TournamentEntry } from "../../../domain/tournament-entry";
import type { TournamentEntryRepository } from "../../../domain/tournament-entry.repository";
import type { UUID } from "../../../../shared/types";
import { TournamentEntryEntity } from "../../../../../infrastructure/persistence/typeorm/entities/tournament-entry.entity";

export class TypeOrmTournamentEntryRepository
  implements TournamentEntryRepository
{
  constructor(private readonly repository: Repository<TournamentEntryEntity>) {}

  async create(entry: TournamentEntry): Promise<TournamentEntry> {
    const entity = this.repository.create(entry);
    await this.repository.save(entity);
    return entity;
  }

  async listByTournament(tournamentId: UUID): Promise<TournamentEntry[]> {
    return await this.repository.find({ where: { tournamentId } });
  }
}
