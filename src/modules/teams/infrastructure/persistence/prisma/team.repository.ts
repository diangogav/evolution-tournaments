import type { Team } from "../../../domain/team";
import type { TeamRepository } from "../../../domain/team.repository";
import { PrismaClient } from "../../../../../generated/prisma";
import type { UUID } from "../../../../shared/types";

export class PrismaTeamRepository implements TeamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(team: Team): Promise<Team> {
    const newTeam = await this.prisma.team.create({
      data: {
        id: team.id,
        displayName: team.displayName,
        shortCode: team.shortCode,
        logoUrl: team.logoUrl,
        managerName: team.managerName,
        minMembers: team.minMembers,
        maxMembers: team.maxMembers,
        countryCode: team.countryCode,
        isActive: team.isActive,
        metadata: team.metadata,
      },
    });

    return newTeam as Team;
  }

  async list(): Promise<Team[]> {
    const teams = await this.prisma.team.findMany();
    return teams as Team[];
  }

  async findById(id: UUID): Promise<Team | undefined> {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      return undefined;
    }

    return team as Team;
  }
}
