import type { Match } from "../../../domain/match";
import type { MatchRepository } from "../../../domain/match.repository";
import { PrismaClient } from "../../../../../generated/prisma";
import { MatchParticipant } from "../../../domain/match-participant";
import { UUID } from "../../../../shared/types";

export class PrismaMatchRepository implements MatchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(match: Match): Promise<Match> {
    const newMatch = await this.prisma.match.create({
      data: {
        id: match.id,
        tournamentId: match.tournamentId,
        roundNumber: match.roundNumber,
        stage: match.stage,
        bestOf: match.bestOf,
        scheduledAt: match.scheduledAt,
        completedAt: match.completedAt,
        format: match.format,
        participants: match.participants as any,
        metadata: match.metadata,
      },
    });

    return {
      ...newMatch,
      participants: newMatch.participants as [MatchParticipant, MatchParticipant],
    };
  }

  async list(): Promise<Match[]> {
    const matches = await this.prisma.match.findMany();
    return matches.map((m) => ({
      ...m,
      participants: m.participants as [MatchParticipant, MatchParticipant],
    }));
  }

  async findById(id: UUID): Promise<Match | undefined> {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return undefined;
    }

    return {
      ...match,
      participants: match.participants as [MatchParticipant, MatchParticipant],
    };
  }

  async update(match: Match): Promise<Match> {
    const updatedMatch = await this.prisma.match.update({
      where: { id: match.id },
      data: {
        completedAt: match.completedAt,
        participants: match.participants as any,
      },
    });

    return {
      ...updatedMatch,
      participants: updatedMatch.participants as [MatchParticipant, MatchParticipant],
    };
  }
}
