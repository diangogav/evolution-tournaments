import { Repository } from "typeorm";
import type { TeamMember } from "../../../domain/team-member";
import type { TeamMemberRepository } from "../../../domain/team-member.repository";
import type { UUID } from "../../../../shared/types";
import { TeamMemberEntity } from "../../../../../infrastructure/persistence/typeorm/entities/team-member.entity";

export class TypeOrmTeamMemberRepository implements TeamMemberRepository {
  constructor(private readonly repository: Repository<TeamMemberEntity>) {}

  async create(teamMember: TeamMember): Promise<TeamMember> {
    const entity = this.repository.create(teamMember);
    await this.repository.save(entity);
    return entity;
  }

  async listByTeam(teamId: UUID): Promise<TeamMember[]> {
    return await this.repository.find({ where: { teamId } });
  }
}
