import { Tournament } from "../../../domain/tournament";
import type { TournamentRepository } from "../../../domain/tournament.repository";
import type { UUID } from "../../../../shared/types";
import { PrismaClient } from "@prisma/client";


export class PrismaTournamentRepository implements TournamentRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async create(tournament: Tournament): Promise<Tournament> {
    const data = tournament.toPrimitives();

    const stored = await this.prisma.tournament.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        discipline: data.discipline,
        format: data.format,
        status: data.status,
        allowMixedParticipants: data.allowMixedParticipants,
        participantType: data.participantType,
        maxParticipants: data.maxParticipants,
        startAt: data.startAt,
        endAt: data.endAt,
        location: data.location,
        webhookUrl: data.webhookUrl,
        metadata: JSON.parse(JSON.stringify(data.metadata)),
      },
    });

    return Tournament.create({
      id: stored.id,
      name: stored.name,
      description: stored.description,
      discipline: stored.discipline,
      format: stored.format,
      status: stored.status,
      allowMixedParticipants: stored.allowMixedParticipants,
      participantType: stored.participantType,
      maxParticipants: stored.maxParticipants,
      startAt: stored.startAt,
      endAt: stored.endAt,
      location: stored.location,
      webhookUrl: stored.webhookUrl,
      metadata: stored.metadata ?? {},
    });
  }

  async list(): Promise<Tournament[]> {
    const list = await this.prisma.tournament.findMany();

    return list.map((stored) =>
      Tournament.create({
        id: stored.id,
        name: stored.name,
        description: stored.description,
        discipline: stored.discipline,
        format: stored.format,
        status: stored.status,
        allowMixedParticipants: stored.allowMixedParticipants,
        participantType: stored.participantType,
        maxParticipants: stored.maxParticipants,
        startAt: stored.startAt,
        endAt: stored.endAt,
        location: stored.location,
        webhookUrl: stored.webhookUrl,
        metadata: stored.metadata ?? {},
      })
    );
  }

  async findById(id: UUID): Promise<Tournament | undefined> {
    const stored = await this.prisma.tournament.findUnique({ where: { id } });
    if (!stored) return undefined;

    return Tournament.create({
      id: stored.id,
      name: stored.name,
      description: stored.description,
      discipline: stored.discipline,
      format: stored.format,
      status: stored.status,
      allowMixedParticipants: stored.allowMixedParticipants,
      participantType: stored.participantType,
      maxParticipants: stored.maxParticipants,
      startAt: stored.startAt,
      endAt: stored.endAt,
      location: stored.location,
      webhookUrl: stored.webhookUrl,
      metadata: stored.metadata ?? {},
    });
  }

  async update(tournament: Tournament): Promise<Tournament> {
    const data = tournament.toPrimitives();

    const stored = await this.prisma.tournament.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        discipline: data.discipline,
        format: data.format,
        status: data.status,
        allowMixedParticipants: data.allowMixedParticipants,
        participantType: data.participantType,
        maxParticipants: data.maxParticipants,
        startAt: data.startAt,
        endAt: data.endAt,
        location: data.location,
        webhookUrl: data.webhookUrl,
        metadata: JSON.parse(JSON.stringify(data.metadata)),
      },
    });

    return Tournament.create({
      id: stored.id,
      name: stored.name,
      description: stored.description,
      discipline: stored.discipline,
      format: stored.format,
      status: stored.status,
      allowMixedParticipants: stored.allowMixedParticipants,
      participantType: stored.participantType,
      maxParticipants: stored.maxParticipants,
      startAt: stored.startAt,
      endAt: stored.endAt,
      location: stored.location,
      webhookUrl: stored.webhookUrl,
      metadata: stored.metadata ?? {},
    });
  }
}
