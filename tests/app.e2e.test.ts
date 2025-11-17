import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app";

const request = (path: string, init?: RequestInit) => {
  const url = `http://localhost:3000${path}`;
  return new Request(url, {
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
};

const jsonBody = (data: unknown) => JSON.stringify(data);

describe("Tournaments API", () => {
  it.only("creates a player and lists it", async () => {
    const { app } = await buildApp();

    const createResponse = await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Yugi Muto",
          nickname: "KingOfGames",
          countryCode: "JP",
        }),
      })
    );

    expect(createResponse.status).toBe(201);
    const newPlayer = await createResponse.json();
    expect(newPlayer.displayName).toBe("Yugi Muto");

    const listResponse = await app.handle(request("/players"));
    const players = await listResponse.json();
    expect(players).toHaveLength(1);
  });

  it.only("runs a basic tournament registration flow", async () => {
    const { app } = await buildApp();

    const playerRes = await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Joey Wheeler",
          nickname: "Joey",
          countryCode: "US",
        }),
      })
    );
    const player = await playerRes.json();

    const participantRes = await app.handle(
      request("/participants", {
        method: "POST",
        body: jsonBody({
          type: "player",
          referenceId: player.id,
          displayName: player.displayName,
        }),
      })
    );
    const participant = await participantRes.json();

    const tournamentRes = await app.handle(
      request("/tournaments", {
        method: "POST",
        body: jsonBody({
          name: "Duelist Kingdom",
          discipline: "Yu-Gi-Oh!",
          format: "single_elimination",
          status: "registration",
          allowMixedParticipants: false,
          participantType: "player",
          maxParticipants: 16,
        }),
      })
    );
    const tournament = await tournamentRes.json();

    const entryRes = await app.handle(
      request("/tournaments/entries", {
        method: "POST",
        body: jsonBody({
          tournamentId: tournament.id,
          participantId: participant.id,
          seed: 1,
        }),
      })
    );
    expect(entryRes.status).toBe(201);

    const listEntriesRes = await app.handle(
      request(`/tournaments/${tournament.id}/entries`)
    );
    const entries = await listEntriesRes.json();
    expect(entries).toHaveLength(1);
    expect(entries[0].participantId).toBe(participant.id);
  });
});

