import type { Participant } from "../../../domain/participant";
import type { ParticipantRepository } from "../../../domain/participant.repository";
import { PrismaClient, Participant as PrismaParticipant } from "../../../../../generated/prisma";
import type { UUID } from "../../../../shared/types";

export class PrismaParticipantRepository implements ParticipantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(participant: Participant): Promise<Participant> {
    const newParticipant = await this.prisma.participant.create({
      data: {
        id: participant.id,
        type: participant.type,
        displayName: participant.displayName,
        countryCode: participant.countryCode,
        seeding: participant.seeding,
        metadata: participant.metadata,
        player: participant.type === 'PLAYER' ? { connect: { id: participant.referenceId } } : undefined,
        team: participant.type === 'TEAM' ? { connect: { id: participant.referenceId } } : undefined,
      },
    });

    return this.mapToDomain(newParticipant);
  }

  async list(): Promise<Participant[]> {
    const participants = await this.prisma.participant.findMany();
    return participants.map(this.mapToDomain);
  }

  async findById(id: UUID): Promise<Participant | null> {
    const participant = await this.prisma.participant.findUnique({
      where: { id },
    });

    if (!participant) {
      return null;
    }

    return this.mapToDomain(participant);
  }

  private mapToDomain(participant: PrismaParticipant): Participant {
    return {
      id: participant.id,
      type: participant.type,
      displayName: participant.displayName,
      countryCode: participant.countryCode,
      seeding: participant.seeding,
      metadata: participant.metadata as ({} | undefined),
      referenceId: participant.playerId || participant.teamId || '',
    };
  }
}
