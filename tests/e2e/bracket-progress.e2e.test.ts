import { beforeAll, describe, test, expect } from "vitest";
import { buildApp } from "../../src/app";
import { treaty } from "@elysiajs/eden";
import { prisma } from "./setup";

describe("🏆 E2E — Bracket progression with match results", () => {
    let api: ReturnType<typeof treaty>;
    let tournamentId: string;

    const participantIds: string[] = [];

    beforeAll(async () => {
        const { app } = await buildApp(prisma);
        api = treaty(app);
    });

    //
    // ------- SETUP -------
    //

    test("1. Create players + participants + tournament", async () => {
        // Players
        for (let i = 1; i <= 8; i++) {
            await api.players.post({
                displayName: `P${i}`,
                countryCode: "VE"
            });
        }

        const players = await api.players.get();

        // Participants
        for (let i = 1; i <= 8; i++) {
            const p = players.data.find((pl: any) => pl.displayName === `P${i}`);

            const res = await api.participants.post({
                type: "PLAYER",
                referenceId: p.id,
                displayName: p.displayName,
                countryCode: "VE",
            });

            participantIds.push(res.data.id);
        }

        expect(participantIds.length).toBe(8);

        // Tournament
        const tour = await api.tournaments.post({
            name: "Torneo Progresion",
            discipline: "YGO",
            format: "SINGLE_ELIMINATION",
            status: "PUBLISHED",
            allowMixedParticipants: true
        });

        tournamentId = tour.data.id;
        expect(tournamentId).toBeDefined();
    });

    test("2. Register entries", async () => {
        for (const pid of participantIds) {
            const response = await api["tournaments"][tournamentId]["entries"].post({
                participantId: pid,
                status: "CONFIRMED"
            });

            expect(response.error).toBeNull();
        }
    });

    test("3. Generate FULL bracket", async () => {
        const response = await api.tournaments[tournamentId]["bracket"]["generate-full"].post();
        expect(response.error).toBeNull();
    });

    //
    // ------- PROGRESSION -------
    //

    test("4. Round 1: Register all winners", async () => {
        const { data: bracket1 } = await api.tournaments[tournamentId]["bracket"].get();
        const round1 = bracket1.rounds.find((round: any) => round.roundNumber === 1);

        expect(round1.matches.length).toBe(4);

        // Ganadores: el primer participante en cada match
        for (const match of round1.matches) {
            const p1 = match.participant1.id;
            const p2 = match.participant2.id;

            const response = await api.tournaments[tournamentId]["matches"][match.id]["result"].post({
                participants: [
                    { participantId: p1, score: 1 },
                    { participantId: p2, score: 0 }
                ]
            });

            expect(response.error).toBeNull();
        }
    });

    test("5. Round 2 should now have REAL participants", async () => {
        const { data: bracket2 } = await api.tournaments[tournamentId]["bracket"].get();
        const round2 = bracket2.rounds.find((round: any) => round.roundNumber === 2);
        expect(round2.matches.length).toBe(2);

        // Now participants should be defined
        for (const match of round2.matches) {
            expect(match.participant1).toBeDefined();
            expect(match.participant2).toBeDefined();
        }
    });

    test("6. Round 2: Register winners", async () => {
        const { data: bracket2 } = await api.tournaments[tournamentId]["bracket"].get();
        const round2 = bracket2.rounds.find((round: any) => round.roundNumber === 2);

        for (const match of round2.matches) {
            const winner = match.participant1.id;

            const response = await api.tournaments[tournamentId]["matches"][match.id]["result"].post({
                participants: [
                    { participantId: winner, score: 2 },
                    { participantId: match.participant2.id, score: 1 }
                ]
            });

            expect(response.error).toBeNull();
        }
    });

    test("7. Final round should now have REAL participants", async () => {
        const { data: bracket3 } = await api.tournaments[tournamentId]["bracket"].get();
        const final = bracket3.rounds.find((round: any) => round.roundNumber === 3);

        expect(final.matches.length).toBe(1);

        const match = final.matches[0];

        expect(match.participant1).toBeDefined();
        expect(match.participant2).toBeDefined();
    });

    test("8. Register Final winner", async () => {
        const { data: bracket } = await api.tournaments[tournamentId]["bracket"].get();
        const final = bracket.rounds.find((round: any) => round.roundNumber === 3);
        const match = final.matches[0];

        const winner = match.participant1.id;

        const response = await api.tournaments[tournamentId]["matches"][match.id]["result"].post({
            participants: [
                { participantId: winner, score: 3 },
                { participantId: match.participant2.id, score: 1 }
            ]
        });

        expect(response.error).toBeNull();
    });

    test("9. GET bracket should show final winner", async () => {
        const { data: bracket } = await api.tournaments[tournamentId]["bracket"].get();
        const final = bracket.rounds.find((round: any) => round.roundNumber === 3);

        const match = final.matches[0];
        expect(match.winnerId).toBe(match.participant1.id);
    });
});
