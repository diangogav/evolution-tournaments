-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "nickname" TEXT,
    "birthDate" TEXT,
    "countryCode" TEXT,
    "contactEmail" TEXT,
    "preferredDisciplines" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "shortCode" TEXT,
    "logoUrl" TEXT,
    "managerName" TEXT,
    "minMembers" INTEGER NOT NULL,
    "maxMembers" INTEGER NOT NULL,
    "countryCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_contactEmail_key" ON "players"("contactEmail");
