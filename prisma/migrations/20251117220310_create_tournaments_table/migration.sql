-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'STARTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discipline" TEXT NOT NULL,
    "format" "TournamentFormat" NOT NULL,
    "status" "TournamentStatus" NOT NULL,
    "allowMixedParticipants" BOOLEAN NOT NULL DEFAULT false,
    "participantType" "ParticipantType",
    "maxParticipants" INTEGER,
    "startAt" TEXT,
    "endAt" TEXT,
    "location" TEXT,
    "metadata" JSONB,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);
