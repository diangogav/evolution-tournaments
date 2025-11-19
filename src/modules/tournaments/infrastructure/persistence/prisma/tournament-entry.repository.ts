import { TournamentEntry } from "../../../domain/tournament-entry";
import type { TournamentEntryRepository } from "../../../domain/tournament-entry.repository";
import type { UUID } from "../../../../shared/types";
import { PrismaClient } from "@prisma/client";

export class PrismaTournamentEntryRepository implements TournamentEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(entry: TournamentEntry): Promise<TournamentEntry> {
    const data = entry.toPrimitives();

    const stored = await this.prisma.tournamentEntry.create({
      data: {
        id: data.id,
        tournamentId: data.tournamentId,
        participantId: data.participantId,
        status: data.status,
        groupId: data.groupId,
        seed: data.seed,
        metadata: JSON.parse(JSON.stringify(data.metadata)),
      },
    });

    return TournamentEntry.create({
      id: stored.id,
      tournamentId: stored.tournamentId,
      participantId: stored.participantId,
      status: stored.status,
      groupId: stored.groupId,
      seed: stored.seed,
      metadata: stored.metadata ?? {},
    });
  }

  async listByTournament(tournamentId: UUID): Promise<TournamentEntry[]> {
    const list = await this.prisma.tournamentEntry.findMany({
      where: { tournamentId },
    });

    return list.map((stored) =>
      TournamentEntry.create({
        id: stored.id,
        tournamentId: stored.tournamentId,
        participantId: stored.participantId,
        status: stored.status,
        groupId: stored.groupId,
        seed: stored.seed,
        metadata: stored.metadata ?? {},
      })
    );
  }
}
