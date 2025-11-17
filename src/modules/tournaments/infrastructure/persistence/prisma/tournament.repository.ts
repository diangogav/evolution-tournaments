import type { Tournament } from "../../../domain/tournament";
import type { TournamentRepository } from "../../../domain/tournament.repository";
import { PrismaClient } from "../../../../../generated/prisma";
import type { UUID } from "../../../../shared/types";

export class PrismaTournamentRepository implements TournamentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(tournament: Tournament): Promise<Tournament> {
    const newTournament = await this.prisma.tournament.create({
      data: {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        discipline: tournament.discipline,
        format: tournament.format,
        status: tournament.status,
        allowMixedParticipants: tournament.allowMixedParticipants,
        participantType: tournament.participantType,
        maxParticipants: tournament.maxParticipants,
        startAt: tournament.startAt,
        endAt: tournament.endAt,
        location: tournament.location,
        // metadata: tournament.metadata,
      },
    });

    return newTournament as Tournament;
  }

  async list(): Promise<Tournament[]> {
    const tournaments = await this.prisma.tournament.findMany();
    return tournaments as Tournament[];
  }

  async findById(id: UUID): Promise<Tournament | undefined> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      return undefined;
    }

    return tournament as Tournament;
  }
}
