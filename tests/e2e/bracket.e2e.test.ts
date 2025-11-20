import { beforeAll, afterAll, describe, test, expect } from "vitest";
import { buildApp } from "../../src/app";
import { treaty } from "@elysiajs/eden";
import { prisma } from "./setup";

describe("🏆 E2E — Full Bracket Generation (8 players)", () => {
    let api: ReturnType<typeof treaty>;
    let tournamentId: string;
    const participantIds: string[] = [];

    beforeAll(async () => {
        const { app } = await buildApp(prisma);
        api = treaty(app);
    });

    test("1. Create 8 players", async () => {
        for (let i = 1; i <= 8; i++) {
            const res = await api.players.post({
                displayName: `Player ${i}`,
                countryCode: "VE"
            });

            expect(res.error).toBeNull();
        }
    });

    test("2. Create 8 participants", async () => {
        const players = await api.players.get();
        expect(players.error).toBeNull();

        for (let i = 1; i <= 8; i++) {
            const player = players.data.find((p: any) => p.displayName === `Player ${i}`);

            const res = await api.participants.post({
                type: "PLAYER",
                referenceId: player.id,
                displayName: player.displayName,
                countryCode: "VE"
            });

            expect(res.error).toBeNull();
            participantIds.push(res.data.id);
        }

        expect(participantIds.length).toBe(8);
    });

    test("3. Create tournament", async () => {
        const res = await api.tournaments.post({
            name: "Torneo 8P",
            discipline: "YGO",
            format: "SINGLE_ELIMINATION",
            status: "PUBLISHED",
            allowMixedParticipants: true
        });

        expect(res.error).toBeNull();
        tournamentId = res.data.id;
    });

    test("4. Register entries", async () => {
        for (const pid of participantIds) {
            const response = await api["tournaments"][tournamentId]["entries"].post({
                participantId: pid,
                status: "CONFIRMED"
            });

            expect(response.error).toBeNull();
        }
    });

    test("5. Generate FULL bracket", async () => {
        const response = await api.tournaments[tournamentId]["bracket"]["generate-full"].post();
        expect(response.error).toBeNull();
        expect(response.status).toBe(201);
    });

    test("6. Fetch bracket and validate", async () => {
        const res = await api.tournaments[tournamentId].bracket.get();

        expect(res.error).toBeNull();
        const bracket = res.data;
        expect(bracket.tournamentId).toBe(tournamentId);
        expect(Array.isArray(bracket.rounds)).toBe(true);

        // -----------------------------
        // Validate rounds count → 3
        // -----------------------------
        expect(bracket.rounds.length).toBe(3);

        const [r1, r2, r3] = bracket.rounds;

        // -----------------------------
        // Round 1: 4 matches
        // -----------------------------
        expect(r1.matches.length).toBe(4);

        r1.matches.forEach((m: any) => {
            expect(m.participant1).toBeDefined();
            expect(m.participant2).toBeDefined();
            expect(m.position).toBeGreaterThan(0);
            expect(m.nextMatchId).toBeDefined();
        });

        // -----------------------------
        // Round 2: 2 matches
        // -----------------------------
        expect(r2.matches.length).toBe(2);
        r2.matches.forEach((m: any) => {
            expect(m.participant1).toBeUndefined(); // because TBD
            expect(m.participant2).toBeUndefined();
            expect(m.nextMatchId).toBeDefined();
        });

        // -----------------------------
        // Final Round 3: 1 match
        // -----------------------------
        expect(r3.matches.length).toBe(1);
        const final = r3.matches[0];

        expect(final.participant1).toBeUndefined();
        expect(final.participant2).toBeUndefined();
        expect(final.nextMatchId).toBeNull();
    });
});
