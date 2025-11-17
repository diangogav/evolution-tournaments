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

describe("Players API", () => {
  it("creates a player with all fields", async () => {
    const { app } = buildApp();

    const createResponse = await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Yugi Muto",
          nickname: "KingOfGames",
          birthDate: "1996-06-04",
          countryCode: "JP",
          contactEmail: "yugi@duelacademy.com",
          preferredDisciplines: ["Yu-Gi-Oh!", "Duel Monsters"],
          isActive: true,
          metadata: { rank: "King", deck: "Dark Magician" },
        }),
      })
    );

    expect(createResponse.status).toBe(201);
    const player = await createResponse.json();
    expect(player.id).toBeDefined();
    expect(player.displayName).toBe("Yugi Muto");
    expect(player.nickname).toBe("KingOfGames");
    expect(player.birthDate).toBe("1996-06-04");
    expect(player.countryCode).toBe("JP");
    expect(player.contactEmail).toBe("yugi@duelacademy.com");
    expect(player.preferredDisciplines).toEqual(["Yu-Gi-Oh!", "Duel Monsters"]);
    expect(player.isActive).toBe(true);
    expect(player.metadata).toEqual({ rank: "King", deck: "Dark Magician" });
  });

  it("creates a player with only required fields", async () => {
    const { app } = buildApp();

    const createResponse = await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Joey Wheeler",
        }),
      })
    );

    expect(createResponse.status).toBe(201);
    const player = await createResponse.json();
    expect(player.id).toBeDefined();
    expect(player.displayName).toBe("Joey Wheeler");
    expect(player.isActive).toBe(true); // default value
  });

  it("lists all players", async () => {
    const { app } = buildApp();

    // Create multiple players
    await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Seto Kaiba",
          nickname: "Kaiba",
          countryCode: "JP",
        }),
      })
    );

    await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Mai Valentine",
          nickname: "Mai",
          countryCode: "JP",
        }),
      })
    );

    await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Tea Gardner",
          nickname: "Tea",
          countryCode: "JP",
        }),
      })
    );

    const listResponse = await app.handle(request("/players"));
    expect(listResponse.status).toBe(200);
    
    const players = await listResponse.json();
    expect(players).toHaveLength(3);
    expect(players.map((p: any) => p.displayName)).toContain("Seto Kaiba");
    expect(players.map((p: any) => p.displayName)).toContain("Mai Valentine");
    expect(players.map((p: any) => p.displayName)).toContain("Tea Gardner");
  });

  it("creates inactive player when isActive is false", async () => {
    const { app } = buildApp();

    const createResponse = await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Retired Player",
          isActive: false,
        }),
      })
    );

    expect(createResponse.status).toBe(201);
    const player = await createResponse.json();
    expect(player.isActive).toBe(false);
  });

  it("creates players with different country codes", async () => {
    const { app } = buildApp();

    const player1Response = await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "American Player",
          countryCode: "US",
        }),
      })
    );

    const player2Response = await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "German Player",
          countryCode: "DE",
        }),
      })
    );

    const player3Response = await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Brazilian Player",
          countryCode: "BR",
        }),
      })
    );

    expect(player1Response.status).toBe(201);
    expect(player2Response.status).toBe(201);
    expect(player3Response.status).toBe(201);

    const player1 = await player1Response.json();
    const player2 = await player2Response.json();
    const player3 = await player3Response.json();

    expect(player1.countryCode).toBe("US");
    expect(player2.countryCode).toBe("DE");
    expect(player3.countryCode).toBe("BR");
  });

  it("creates players with custom metadata", async () => {
    const { app } = buildApp();

    const createResponse = await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Pro Player",
          metadata: {
            elo: 2400,
            wins: 100,
            losses: 20,
            sponsoredBy: "KaibaCorp",
            achievements: ["World Champion 2020", "Regional Winner 2021"],
          },
        }),
      })
    );

    expect(createResponse.status).toBe(201);
    const player = await createResponse.json();
    expect(player.metadata.elo).toBe(2400);
    expect(player.metadata.wins).toBe(100);
    expect(player.metadata.achievements).toHaveLength(2);
  });

  it("handles preferred disciplines as array", async () => {
    const { app } = buildApp();

    const createResponse = await app.handle(
      request("/players", {
        method: "POST",
        body: jsonBody({
          displayName: "Multi-Game Player",
          preferredDisciplines: ["Chess", "Poker", "Magic: The Gathering"],
        }),
      })
    );

    expect(createResponse.status).toBe(201);
    const player = await createResponse.json();
    expect(player.preferredDisciplines).toEqual([
      "Chess",
      "Poker",
      "Magic: The Gathering",
    ]);
  });

  it("lists empty array when no players exist", async () => {
    const { app } = buildApp();

    const listResponse = await app.handle(request("/players"));
    expect(listResponse.status).toBe(200);
    
    const players = await listResponse.json();
    expect(players).toEqual([]);
  });
});
