import type { TeamMember } from "../../../domain/team-member";
import type { TeamMemberRepository } from "../../../domain/team-member.repository";
import { PrismaClient } from "../../../../../generated/prisma";
import type { UUID } from "../../../../shared/types";

export class PrismaTeamMemberRepository implements TeamMemberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(member: TeamMember): Promise<TeamMember> {
    const newMember = await this.prisma.teamMember.create({
      data: {
        id: member.id,
        teamId: member.teamId,
        playerId: member.playerId,
        role: member.role,
        isCaptain: member.isCaptain,
        joinedAt: member.joinedAt,
        leftAt: member.leftAt,
      },
    });

    return newMember as TeamMember;
  }

  async listByTeam(teamId: UUID): Promise<TeamMember[]> {
    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
    });

    return members as TeamMember[];
  }
}
