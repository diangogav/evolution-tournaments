import { beforeAll, describe, test, expect } from "vitest";
import { buildApp } from "../../src/app";
import { treaty } from "@elysiajs/eden";
import { prisma } from "./setup";

describe("🔄 E2E — Tournament State Flow", () => {
    let api: ReturnType<typeof treaty>;
    let tournamentId: string;
    const participantIds: string[] = [];
    let matchId: string;

    beforeAll(async () => {
        const { app } = await buildApp(prisma);
        api = treaty(app);
    });

    describe("Setup: Create participants", () => {
        test.only("1. Create 2 players", async () => {
            for (let i = 1; i <= 2; i++) {
                const res = await api.players.post({
                    displayName: `StateFlow Player ${i}`,
                    countryCode: "VE"
                });
                expect(res.error).toBeNull();
            }
        });

        test.only("2. Create 2 participants", async () => {
            const players = await api.players.get();
            expect(players.error).toBeNull();

            for (let i = 1; i <= 2; i++) {
                const player = players.data.find((p: any) => p.displayName === `StateFlow Player ${i}`);
                const res = await api.participants.post({
                    type: "PLAYER",
                    referenceId: player.id,
                    displayName: player.displayName,
                    countryCode: "VE"
                });

                expect(res.error).toBeNull();
                participantIds.push(res.data.id);
            }

            expect(participantIds.length).toBe(2);
        });
    });

    describe("Phase 1: PUBLISHED state operations", () => {
        test.only("3. Create tournament in PUBLISHED state", async () => {
            const res = await api.tournaments.post({
                name: "State Flow Test Tournament",
                discipline: "YGO",
                format: "SINGLE_ELIMINATION",
                status: "PUBLISHED",
                allowMixedParticipants: true
            });

            expect(res.error).toBeNull();
            expect(res.data.status).toBe("PUBLISHED");
            tournamentId = res.data.id;
        });

        test.only("4. Enroll participants (allowed in PUBLISHED)", async () => {
            for (const pid of participantIds) {
                const response = await api.tournaments[tournamentId].entries.post({
                    participantId: pid,
                    status: "CONFIRMED"
                });

                expect(response.error).toBeNull();
                expect(response.data.status).toBe("CONFIRMED");
            }
        });

        test.only("5. Withdraw participant (allowed in PUBLISHED)", async () => {
            const response = await api.tournaments[tournamentId].entries[participantIds[0]].delete();
            expect(response.error).toBeNull();
        });

        test.only("6. Re-enroll participant (test reactivation)", async () => {
            const response = await api.tournaments[tournamentId].entries.post({
                participantId: participantIds[0],
                status: "CONFIRMED"
            });

            expect(response.error).toBeNull();
            expect(response.data.status).toBe("CONFIRMED");
        });
    });

    describe("Phase 2: Auto-start on bracket generation", () => {
        test.only("7. Generate bracket (should auto-start tournament)", async () => {
            const response = await api.tournaments[tournamentId].bracket["generate-full"].post();
            expect(response.error).toBeNull();
            expect(response.status).toBe(201);
        });

        test.only("8. Verify tournament is now in STARTED state", async () => {
            const res = await api.tournaments[tournamentId].get();
            expect(res.error).toBeNull();
            expect(res.data.status).toBe("STARTED");
        });

        test.only("9. Get match ID for later tests", async () => {
            const res = await api.tournaments[tournamentId].matches.get();
            expect(res.error).toBeNull();
            expect(res.data.length).toBeGreaterThan(0);
            matchId = res.data[0].id;
        });
    });

    describe("Phase 3: STARTED state validations", () => {
        test.only("10. Enrollment should fail in STARTED state", async () => {
            // Create a new participant to try enrolling
            const playerRes = await api.players.post({
                displayName: "Late Player",
                countryCode: "VE"
            });
            expect(playerRes.error).toBeNull();

            const participantRes = await api.participants.post({
                type: "PLAYER",
                referenceId: playerRes.data.id,
                displayName: "Late Player",
                countryCode: "VE"
            });
            expect(participantRes.error).toBeNull();

            // Try to enroll in STARTED tournament
            const enrollRes = await api.tournaments[tournamentId].entries.post({
                participantId: participantRes.data.id,
                status: "CONFIRMED"
            });

            expect(enrollRes.error).not.toBeNull();
            expect(enrollRes.status).toBe(500);
        });

        test.only("11. Withdrawal should fail in STARTED state", async () => {
            const response = await api.tournaments[tournamentId].entries[participantIds[0]].delete();
            expect(response.error).not.toBeNull();
            expect(response.status).toBe(500);
        });

        test.only("12. Bracket generation should fail in STARTED state", async () => {
            const response = await api.tournaments[tournamentId].bracket["generate-full"].post();
            expect(response.error).not.toBeNull();
            expect(response.status).toBe(500);
        });
    });

    describe("Phase 4: Auto-complete on final match", () => {
        test.only("13. Record match result (should auto-complete tournament)", async () => {
            const response = await api.tournaments[tournamentId].matches[matchId].result.post({
                participants: [
                    { participantId: participantIds[0], score: 2 },
                    { participantId: participantIds[1], score: 1 }
                ]
            });

            expect(response.error).toBeNull();
        });

        test.only("14. Verify tournament is now in COMPLETED state", async () => {
            const res = await api.tournaments[tournamentId].get();
            expect(res.error).toBeNull();
            expect(res.data.status).toBe("COMPLETED");
        });
    });

    describe("Phase 5: COMPLETED state validations", () => {
        test.only("15. Enrollment should fail in COMPLETED state", async () => {
            const playerRes = await api.players.post({
                displayName: "Very Late Player",
                countryCode: "VE"
            });
            expect(playerRes.error).toBeNull();

            const participantRes = await api.participants.post({
                type: "PLAYER",
                referenceId: playerRes.data.id,
                displayName: "Very Late Player",
                countryCode: "VE"
            });
            expect(participantRes.error).toBeNull();

            const enrollRes = await api.tournaments[tournamentId].entries.post({
                participantId: participantRes.data.id,
                status: "CONFIRMED"
            });

            expect(enrollRes.error).not.toBeNull();
            expect(enrollRes.status).toBe(500);
        });
    });

    describe("Phase 6: Cancellation tests", () => {
        let cancelTestTournamentId: string;

        test.only("16. Create tournament for cancellation test", async () => {
            const res = await api.tournaments.post({
                name: "Cancellation Test Tournament",
                discipline: "YGO",
                format: "SINGLE_ELIMINATION",
                status: "PUBLISHED",
                allowMixedParticipants: true
            });

            expect(res.error).toBeNull();
            expect(res.data.status).toBe("PUBLISHED");
            cancelTestTournamentId = res.data.id;
        });

        test.only("17. Cancel tournament in PUBLISHED state", async () => {
            const response = await api.tournaments[cancelTestTournamentId].cancel.put();
            expect(response.error).toBeNull();
        });

        test.only("18. Verify tournament is now CANCELLED", async () => {
            const res = await api.tournaments[cancelTestTournamentId].get();
            expect(res.error).toBeNull();
            expect(res.data.status).toBe("CANCELLED");
        });
    });
});
