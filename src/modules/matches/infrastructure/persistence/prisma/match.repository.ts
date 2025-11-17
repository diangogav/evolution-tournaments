import type { Match } from "../../../domain/match";
import type { MatchRepository } from "../../../domain/match.repository";
import { PrismaClient } from "../../../../../generated/prisma";
import { MatchParticipant } from "../../../domain/match-participant";

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
}
