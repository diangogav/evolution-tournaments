import { InMemoryDatabase } from "../../../../../infrastructure/persistence/in-memory/database";
import type { UUID } from "../../../../shared/types";
import type { TeamMember } from "../../domain/team-member";
import type { TeamMemberRepository } from "../../domain/team-member.repository";

export class InMemoryTeamMemberRepository implements TeamMemberRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  create(member: TeamMember): TeamMember {
    this.db.collections.teamMembers.set(member.id, member);
    return member;
  }

  listByTeam(teamId: UUID): TeamMember[] {
    return Array.from(this.db.collections.teamMembers.values()).filter(
      (member) => member.teamId === teamId
    );
  }
}

