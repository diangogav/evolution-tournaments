import { Team } from "../../../domain/team";
import type { TeamRepository } from "../../../domain/team.repository";
import type { UUID } from "../../../../shared/types";
import { PrismaClient } from "@prisma/client";


export class PrismaTeamRepository implements TeamRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async create(team: Team): Promise<Team> {
    const data = team.toPrimitives();

    const stored = await this.prisma.team.create({
      data: { ...data, metadata: JSON.parse(JSON.stringify(data.metadata)) },
    });

    return Team.fromPrimitives({
      ...stored,
      metadata: stored.metadata ?? {},
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
    });
  }

  async list(): Promise<Team[]> {
    const list = await this.prisma.team.findMany();
    return list.map((t) => Team.fromPrimitives({ ...t }));
  }

  async findById(id: UUID): Promise<Team | undefined> {
    const team = await this.prisma.team.findUnique({ where: { id } });
    return team ? Team.fromPrimitives({ ...team }) : undefined;
  }
}
