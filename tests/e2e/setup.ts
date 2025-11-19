import { beforeAll, afterAll } from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import supertest from "supertest";
import util from "node:util";
import { exec } from "node:child_process";
import { buildApp } from "../../src/app";

const asyncExec = util.promisify(exec);

export let prisma: PrismaClient;
export let request: any;
export let server: any;
export let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;

beforeAll(async () => {
    console.log("🚀 Starting Postgres Testcontainer (Node)...");

    container = await new PostgreSqlContainer("postgres:16.4-alpine")
        .withDatabase("tests")
        .withUsername("postgres")
        .withPassword("password")
        .start();

    const dbUrl = container.getConnectionUri();
    console.log("🟢 DB Ready:", dbUrl);

    process.env.DATABASE_URL = dbUrl;
    process.env.USE_PRISMA = "true";

    console.log("🔄 Running migrations…");
    await asyncExec(`./node_modules/.bin/prisma migrate deploy`);

    prisma = new PrismaClient();
    await prisma.$connect();
    await cleanDatabase();
});

afterAll(async () => {
    console.log("🧹 Cleanup test environment…");
    await prisma?.$disconnect();
    await container?.stop();
});

async function cleanDatabase() {
    const tablenames = await prisma.$queryRaw<
        Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const { tablename } of tablenames) {
        if (tablename !== "_prisma_migrations") {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
        }
    }

}
