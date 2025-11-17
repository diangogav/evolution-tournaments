-- CreateEnum
CREATE TYPE "ParticipantType" AS ENUM ('PLAYER', 'TEAM');

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "type" "ParticipantType" NOT NULL,
    "playerId" TEXT,
    "teamId" TEXT,
    "displayName" TEXT NOT NULL,
    "countryCode" TEXT,
    "seeding" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participants_playerId_key" ON "participants"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "participants_teamId_key" ON "participants"("teamId");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
