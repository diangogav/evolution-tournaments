import { Participant } from "../../../domain/participant";
import type { ParticipantRepository } from "../../../domain/participant.repository";
import type { UUID } from "../../../../shared/types";
import { PrismaClient } from "@prisma/client";

export class PrismaParticipantRepository implements ParticipantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(participant: Participant): Promise<Participant> {
    const data = participant.toPrimitives();

    const stored = await this.prisma.participant.create({
      data: {
        id: data.id,
        type: data.type,
        displayName: data.displayName,
        countryCode: data.countryCode,
        seeding: data.seeding,
        metadata: JSON.parse(JSON.stringify(data.metadata)),
        playerId: data.type === "PLAYER" ? data.referenceId : undefined,
        teamId: data.type === "TEAM" ? data.referenceId : undefined,
      },
    });

    return Participant.create({
      id: stored.id,
      type: stored.type,
      displayName: stored.displayName,
      countryCode: stored.countryCode,
      seeding: stored.seeding,
      referenceId: stored.playerId ?? stored.teamId!,
      metadata: stored.metadata ?? {},
    });
  }

  async list(): Promise<Participant[]> {
    const list = await this.prisma.participant.findMany();

    return list.map((stored) =>
      Participant.create({
        id: stored.id,
        type: stored.type,
        displayName: stored.displayName,
        countryCode: stored.countryCode,
        seeding: stored.seeding,
        referenceId: stored.playerId ?? stored.teamId!,
        metadata: stored.metadata ?? {},
      })
    );
  }

  async findById(id: UUID): Promise<Participant | null> {
    const stored = await this.prisma.participant.findUnique({ where: { id } });
    if (!stored) return null;

    return Participant.create({
      id: stored.id,
      type: stored.type,
      displayName: stored.displayName,
      countryCode: stored.countryCode,
      seeding: stored.seeding,
      referenceId: stored.playerId ?? stored.teamId!,
      metadata: stored.metadata ?? {},
    });
  }
}
