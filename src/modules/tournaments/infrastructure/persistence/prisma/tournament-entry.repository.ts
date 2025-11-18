import type { TournamentEntry } from "../../../domain/tournament-entry";
import type { TournamentEntryRepository } from "../../../domain/tournament-entry.repository";
import { PrismaClient } from "../../../../../generated/prisma";
import type { UUID } from "../../../../shared/types";

export class PrismaTournamentEntryRepository implements TournamentEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(entry: TournamentEntry): Promise<TournamentEntry> {
    const newEntry = await this.prisma.tournamentEntry.create({
      data: {
        id: entry.id,
        tournamentId: entry.tournamentId,
        participantId: entry.participantId,
        status: entry.status,
        groupId: entry.groupId,
        seed: entry.seed,
        // metadata: entry.metadata,
      },
    });

    return newEntry as TournamentEntry;
  }

  async listByTournament(tournamentId: UUID): Promise<TournamentEntry[]> {
    const entries = await this.prisma.tournamentEntry.findMany({
      where: { tournamentId },
    });

    return entries as TournamentEntry[];
  }
}
