import { PrismaClient } from "@prisma/client";
import { TeamMember } from "../../../domain/team-member";
import type { TeamMemberRepository } from "../../../domain/team-member.repository";


export class PrismaTeamMemberRepository implements TeamMemberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(member: TeamMember): Promise<TeamMember> {
    const data = member.toPrimitives();

    const stored = await this.prisma.teamMember.create({
      data,
    });

    return TeamMember.create(stored);
  }

  async listByTeam(teamId: string): Promise<TeamMember[]> {
    const list = await this.prisma.teamMember.findMany({ where: { teamId } });
    return list.map((m) => TeamMember.create(m));
  }
}
