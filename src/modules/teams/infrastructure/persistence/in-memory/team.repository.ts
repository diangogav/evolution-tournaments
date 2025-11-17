import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { UUID } from "../../../../shared/types";
import type { Team } from "../../domain/team";
import type { TeamRepository } from "../../domain/team.repository";

export class InMemoryTeamRepository implements TeamRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async create(team: Team): Promise<Team> {
    this.db.collections.teams.set(team.id, team);
    return team;
  }

  async list(): Promise<Team[]> {
    return Array.from(this.db.collections.teams.values());
  }

  async findById(id: UUID): Promise<Team | undefined> {
    return this.db.collections.teams.get(id);
  }
}

