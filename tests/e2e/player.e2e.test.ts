import { test, describe, beforeAll, expect } from "vitest";
import { buildApp } from "../../src/app";
import { treaty } from "@elysiajs/eden";
import { prisma } from "./setup";

describe("Players E2E", () => {
    let api: any;

    beforeAll(async () => {
        const { app } = await buildApp(prisma);
        api = treaty(app);
    });

    test("creates a player", async () => {
        const { data, error } = await api.players.post({
            displayName: "E2E Player",
            countryCode: "VE"
        });

        expect(error).toBeNull();
        expect(data.displayName).toBe("E2E Player");
        expect(data.countryCode).toBe("VE");
        expect(typeof data.id).toBe("string");
    });
});
