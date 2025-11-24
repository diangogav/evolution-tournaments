import type { Match } from "../../../domain/match";
import { Match as MatchEntity } from "../../../domain/match";
import type { MatchParticipant } from "../../../domain/match-participant";
import type { MatchRepository } from "../../../domain/match.repository";
import type { UUID } from "../../../../shared/types";
import { PrismaClient } from "@prisma/client";

export class PrismaMatchRepository implements MatchRepository {
  constructor(private readonly prisma: PrismaClient) { }

  private mapRowToDomain(row: any): Match {
    const raw = row.participants;

    if (!Array.isArray(raw) || raw.length !== 2) {
      throw new Error("Invalid participants payload for Match");
    }

    const participants: [MatchParticipant, MatchParticipant] = [
      {
        participantId: raw[0].participantId,
        score: raw[0].score ?? null,
        result: raw[0].result ?? null,
        lineup: raw[0].lineup,
      },
      {
        participantId: raw[1].participantId,
        score: raw[1].score ?? null,
        result: raw[1].result ?? null,
        lineup: raw[1].lineup,
      },
    ];

    return MatchEntity.fromPrimitives({
      id: row.id,
      tournamentId: row.tournamentId,
      roundNumber: row.roundNumber,
      stage: row.stage,
      bestOf: row.bestOf,
      scheduledAt: row.scheduledAt,
      completedAt: row.completedAt,
      format: row.format,
      participants,
      metadata: row.metadata ?? {},
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(match: Match): Promise<Match> {
    const data = match.toPrimitives();

    const stored = await this.prisma.match.create({
      data: {
        id: data.id,
        tournamentId: data.tournamentId,
        roundNumber: data.roundNumber,
        stage: data.stage,
        bestOf: data.bestOf,
        scheduledAt: data.scheduledAt,
        completedAt: data.completedAt,
        format: data.format,
        participants: JSON.parse(JSON.stringify(data.participants)),
        metadata: JSON.parse(JSON.stringify(data.metadata)),
      },
    });

    return this.mapRowToDomain(stored);
  }

  async list(): Promise<Match[]> {
    const rows = await this.prisma.match.findMany();
    return rows.map((row) => this.mapRowToDomain(row));
  }

  async findById(id: UUID): Promise<Match | null> {
    const row = await this.prisma.match.findUnique({
      where: { id },
    });

    if (!row) {
      return null;
    }

    return this.mapRowToDomain(row);
  }

  async update(match: Match): Promise<Match> {
    const data = match.toPrimitives();

    const stored = await this.prisma.match.update({
      where: { id: data.id },
      data: {
        roundNumber: data.roundNumber,
        stage: data.stage,
        bestOf: data.bestOf,
        scheduledAt: data.scheduledAt,
        completedAt: data.completedAt,
        format: data.format,
        participants: JSON.parse(JSON.stringify(data.participants)),
        metadata: JSON.parse(JSON.stringify(data.metadata)),
      },
    });

    return this.mapRowToDomain(stored);
  }

  async listByTournament(tournamentId: UUID): Promise<Match[]> {
    const rows = await this.prisma.match.findMany({
      where: { tournamentId },
    });

    return rows.map((row) => this.mapRowToDomain(row));
  }
}
