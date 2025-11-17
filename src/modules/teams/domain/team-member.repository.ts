import type { UUID } from "../../shared/types";
import type { TeamMember } from "./team-member";

export interface TeamMemberRepository {
  create(member: TeamMember): Promise<TeamMember>;
  listByTeam(teamId: UUID): Promise<TeamMember[]>;
}

