import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { WithdrawTournamentEntry } from "../../src/modules/tournaments/application/withdraw-tournament-entry.use-case";
import { PrismaTournamentEntryRepository } from "../../src/modules/tournaments/infrastructure/persistence/prisma/tournament-entry.repository";
import { AnnullMatchResult } from "../../src/modules/matches/application/annull-match-result.use-case";
import { EditMatchResult } from "../../src/modules/matches/application/edit-match-result.use-case";
import { PrismaMatchRepository } from "../../src/modules/matches/infrastructure/persistence/prisma/match.repository";
import { TournamentEntry } from "../../src/modules/tournaments/domain/tournament-entry";
import { Match } from "../../src/modules/matches/domain/match";

describe("Withdraw and Match Results E2E", () => {
    let container: StartedPostgreSqlContainer;
    let prisma: PrismaClient;
    let tournamentEntryRepo: PrismaTournamentEntryRepository;
    let matchRepo: PrismaMatchRepository;

    beforeAll(async () => {
        container = await new PostgreSqlContainer("postgres:15").start();
        const databaseUrl = container.getConnectionUri();

        process.env.DATABASE_URL = databaseUrl;

        execSync("npx prisma migrate deploy", {
            env: { ...process.env, DATABASE_URL: databaseUrl },
        });

        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
        });

        tournamentEntryRepo = new PrismaTournamentEntryRepository(prisma);
        matchRepo = new PrismaMatchRepository(prisma);
    }, 60000);

    afterAll(async () => {
        if (prisma) {
            await prisma.$disconnect();
        }
        if (container) {
            await container.stop();
        }
    });

    it("should allow a participant to withdraw from a tournament in PUBLISHED state", async () => {
        // Arrange
        const tournament = await prisma.tournament.create({
            data: {
                name: "Test Tournament",
                discipline: "Test",
                format: "SINGLE_ELIMINATION",
                status: "PUBLISHED", // Must be PUBLISHED for withdrawal
                participantType: "PLAYER",
            },
        });

        const participant = await prisma.participant.create({
            data: {
                displayName: "Player 1",
                type: "PLAYER"
            }
        })

        const entry = await tournamentEntryRepo.create(
            TournamentEntry.create({
                id: "entry-1",
                tournamentId: tournament.id,
                participantId: participant.id,
                status: "CONFIRMED", // Changed from PENDING to CONFIRMED
                metadata: {},
            })
        );

        // Act
        const tournamentRepo = new (await import("../../src/modules/tournaments/infrastructure/persistence/prisma/tournament.repository")).PrismaTournamentRepository(prisma);
        const useCase = new WithdrawTournamentEntry(tournamentEntryRepo, tournamentRepo);
        await useCase.execute(entry.participantId, tournament.id);

        // Assert
        const updatedEntry = await tournamentEntryRepo.findByTournamentAndParticipant(tournament.id, entry.participantId);
        expect(updatedEntry?.status).toBe("WITHDRAWN");
    });

    it("should allow annulling a match result", async () => {
        // Arrange
        const tournament = await prisma.tournament.create({
            data: {
                name: "Match Tournament",
                discipline: "Test",
                format: "SINGLE_ELIMINATION",
                status: "STARTED",
            },
        });

        const p1 = await prisma.participant.create({ data: { displayName: "P1", type: "PLAYER" } });
        const p2 = await prisma.participant.create({ data: { displayName: "P2", type: "PLAYER" } });

        const match = await matchRepo.create(
            Match.create({
                id: "match-1",
                tournamentId: tournament.id,
                roundNumber: 1,
                stage: null,
                bestOf: 1,
                scheduledAt: null,
                format: "SINGLE_ELIMINATION",
                participants: [
                    { participantId: p1.id, score: 1, result: "win" },
                    { participantId: p2.id, score: 0, result: "loss" },
                ],
                completedAt: new Date().toISOString(),
                metadata: {},
            })
        );

        // Act
        const useCase = new AnnullMatchResult(matchRepo);
        await useCase.execute(match.id);

        // Assert
        const updatedMatch = await matchRepo.findById(match.id);
        expect(updatedMatch?.completedAt).toBeNull();
        expect(updatedMatch?.participants[0].result).toBeNull();
        expect(updatedMatch?.participants[0].score).toBeNull();
    });

    it("should allow editing a match result", async () => {
        // Arrange
        const tournament = await prisma.tournament.create({
            data: {
                name: "Edit Match Tournament",
                discipline: "Test",
                format: "SINGLE_ELIMINATION",
                status: "STARTED",
            },
        });

        const p1 = await prisma.participant.create({ data: { displayName: "P1", type: "PLAYER" } });
        const p2 = await prisma.participant.create({ data: { displayName: "P2", type: "PLAYER" } });

        const match = await matchRepo.create(
            Match.create({
                id: "match-2",
                tournamentId: tournament.id,
                roundNumber: 1,
                stage: null,
                bestOf: 1,
                scheduledAt: null,
                format: "SINGLE_ELIMINATION",
                participants: [
                    { participantId: p1.id, score: 1, result: "win" },
                    { participantId: p2.id, score: 0, result: "loss" },
                ],
                completedAt: new Date().toISOString(),
                metadata: {},
            })
        );

        // Act
        const useCase = new EditMatchResult(matchRepo);
        await useCase.execute(match.id, [
            { participantId: p1.id, score: 2, result: "win" },
            { participantId: p2.id, score: 1, result: "loss" },
        ]);

        // Assert
        const updatedMatch = await matchRepo.findById(match.id);
        expect(updatedMatch?.participants[0].score).toBe(2);
        expect(updatedMatch?.participants[1].score).toBe(1);
    });
});
