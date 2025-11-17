import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { UUID } from "../../../../shared/types";
import type { Team } from "../../domain/team";
import type { TeamRepository } from "../../domain/team.repository";

export class InMemoryTeamRepository implements TeamRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  create(team: Team): Team {
    this.db.collections.teams.set(team.id, team);
    return team;
  }

  list(): Team[] {
    return Array.from(this.db.collections.teams.values());
  }

  findById(id: UUID): Team | undefined {
    return this.db.collections.teams.get(id);
  }
}

