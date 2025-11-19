import { beforeAll, afterAll, describe, test, expect } from "vitest";
import { treaty } from "@elysiajs/eden";
import { buildApp } from "../../src/app";
import { prisma } from "./setup";

describe("🏆 E2E Tournament Flow — 8 Participants", () => {
    let api: ReturnType<typeof treaty>;
    let tournamentId: string;
    let participantIds: string[] = [];
    let entryIds: string[] = [];

    beforeAll(async () => {
        const { app } = await buildApp(prisma);
        api = treaty(app);
    });

    test("1. Create 8 players", async () => {
        for (let i = 1; i <= 8; i++) {
            const response = await api.players.post({
                displayName: `Player ${i}`,
                countryCode: "VE",
            });

            expect(response.error).toBeNull();
            expect(response.data.displayName).toBe(`Player ${i}`);
        }
    });

    test("2. Create 8 participants", async () => {
        for (let i = 1; i <= 8; i++) {
            const playersResponse = await api.players.get();
            const player = playersResponse.data.find((p: any) => p.displayName === `Player ${i}`);

            const participant = await api.participants.post({
                type: "PLAYER",
                referenceId: player.id,
                displayName: player.displayName,
                countryCode: "VE",
            });

            expect(participant.error).toBeNull();
            participantIds.push(participant.data.id);
        }

        expect(participantIds.length).toBe(8);
    });

    test("3. Create tournament", async () => {
        const response = await api.tournaments.post({
            name: "Torneo 8P",
            discipline: "YGO",
            format: "SINGLE_ELIMINATION",
            status: "PUBLISHED",
            allowMixedParticipants: true,
        });

        expect(response.error).toBeNull();
        tournamentId = response.data.id;
    });

    test("4. Register 8 entries", async () => {
        for (const pid of participantIds) {
            const response = await api["tournaments"][tournamentId]["entries"].post({
                participantId: pid,
                status: "CONFIRMED",
            });

            expect(response.error).toBeNull();
            entryIds.push(response.data.id);
        }

        expect(entryIds.length).toBe(8);
    });

    test("5. Generate bracket", async () => {
        const response = await api.tournaments[tournamentId]["bracket"]["generate"].post();

        expect(response.error).toBeNull();
    });

    test("6. Fetch Round 1 matches", async () => {
        const response = await api.tournaments[tournamentId]["matches"].get();

        expect(response.error).toBeNull();
        const matches = response.data;

        // 8 participants → 4 matches R1
        expect(matches.length).toBe(4);

        // ensure all matches are round 1
        matches.forEach((m: any) => {
            expect(m.roundNumber).toBe(1);
            expect(m.participants.length).toBe(2);
        });
    });

    test("7. Submit results for Round 1", async () => {
        const response = await api.tournaments[tournamentId]["matches"].get();

        const matches = response.data;

        for (const match of matches) {
            const p1 = match.participants[0].participantId;
            const p2 = match.participants[1].participantId;

            const response = await api.tournaments[tournamentId]["matches"][match.id]["result"].post({
                participants: [
                    { participantId: p1, score: 1 },
                    { participantId: p2, score: 0 },
                ],
            });

            expect(response.error).toBeNull();
        }
    });

    test("8. Fetch Round 2 matches", async () => {
        const response = await api.tournaments[tournamentId]["matches"].get();

        const matchesR2 = response.data.filter((m: any) => m.roundNumber === 2);

        // 4 winners → 2 matches
        expect(matchesR2.length).toBe(2);
    });

    test("9. Submit results for Round 2", async () => {
        const response = await api.tournaments[tournamentId]["matches"].get();
        const matchesR2 = response.data.filter((m: any) => m.roundNumber === 2);

        for (const match of matchesR2) {
            const win1 = match.participants[0].participantId;

            const response = await api.tournaments[tournamentId]["matches"][match.id]["result"].post({
                participants: [
                    { participantId: win1, score: 2 },
                    { participantId: match.participants[1].participantId, score: 1 },
                ],
            });

            expect(response.error).toBeNull();
        }
    });

    test("10. Fetch Final (Round 3)", async () => {
        const response = await api.tournaments[tournamentId]["matches"].get();
        const finalMatch = response.data.find((m: any) => m.roundNumber === 3);

        expect(finalMatch).toBeDefined();
        expect(finalMatch.participants.length).toBe(2);
    });

    test("11. Submit Final result", async () => {
        const response = await api.tournaments[tournamentId]["matches"].get();
        const finalMatch = response.data.find((m: any) => m.roundNumber === 3);

        const winner = finalMatch.participants[0].participantId;

        const result = await api.tournaments[tournamentId]["matches"][finalMatch.id]["result"].post({
            participants: [
                { participantId: winner, score: 3 },
                { participantId: finalMatch.participants[1].participantId, score: 1 },
            ],
        });

        expect(result.error).toBeNull();
    });
});
