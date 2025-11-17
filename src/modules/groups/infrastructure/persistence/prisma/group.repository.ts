import type { Group } from "../../../domain/group";
import type { GroupRepository } from "../../../domain/group.repository";
import { PrismaClient } from "../../../../../generated/prisma";

export class PrismaGroupRepository implements GroupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(group: Group): Promise<Group> {
    const newGroup = await this.prisma.group.create({
      data: {
        id: group.id,
        tournamentId: group.tournamentId,
        name: group.name,
        metadata: group.metadata,
        participants: {
          connect: group.participants.map((id) => ({ id })),
        },
      },
    });

    return {
      ...newGroup,
      participants: group.participants,
    };
  }

  async list(): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      include: {
        participants: true,
      },
    });

    return groups.map((g) => ({
      ...g,
      participants: g.participants.map((p) => p.id),
    }));
  }
}
