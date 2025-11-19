import pkg from '@prisma/client';
const { PrismaClient, ParticipantType, TournamentFormat, TournamentStatus, TournamentEntryStatus } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  //
  // ───────────────────────────────────────────────
  //  PLAYERS
  // ───────────────────────────────────────────────
  //
  const playerA = await prisma.player.create({
    data: {
      displayName: "Juan Gamer",
      nickname: "JG",
      countryCode: "VE",
    },
  });

  const playerB = await prisma.player.create({
    data: {
      displayName: "Diango Destroyer",
      nickname: "Diango",
      countryCode: "VE",
    },
  });

  const playerC = await prisma.player.create({
    data: {
      displayName: "Luis Master",
      nickname: "LM",
      countryCode: "DO",
    },
  });

  //
  // ───────────────────────────────────────────────
  //  TEAM
  // ───────────────────────────────────────────────
  //
  const teamAlpha = await prisma.team.create({
    data: {
      displayName: "Team Alpha",
      shortCode: "TA",
      minMembers: 2,
      maxMembers: 5,
      countryCode: "VE",
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: teamAlpha.id,
      playerId: playerA.id,
      role: "Captain",
      isCaptain: true,
      joinedAt: new Date().toISOString(),
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: teamAlpha.id,
      playerId: playerB.id,
      role: "Player",
      joinedAt: new Date().toISOString(),
    },
  });

  //
  // ───────────────────────────────────────────────
  //  PARTICIPANTS (player + team)
  // ───────────────────────────────────────────────
  //
  const participantPlayerA = await prisma.participant.create({
    data: {
      type: ParticipantType.PLAYER,
      playerId: playerA.id,
      displayName: playerA.displayName,
      countryCode: "VE",
      seeding: 1,
    },
  });

  const participantPlayerB = await prisma.participant.create({
    data: {
      type: ParticipantType.PLAYER,
      playerId: playerB.id,
      displayName: playerB.displayName,
      countryCode: "VE",
      seeding: 2,
    },
  });

  const participantTeamAlpha = await prisma.participant.create({
    data: {
      type: ParticipantType.TEAM,
      teamId: teamAlpha.id,
      displayName: teamAlpha.displayName,
      countryCode: "VE",
      seeding: 3,
    },
  });

  //
  // ───────────────────────────────────────────────
  //  TOURNAMENT
  // ───────────────────────────────────────────────
  //
  const tournament = await prisma.tournament.create({
    data: {
      name: "Torneo Demo Eliminación Directa",
      discipline: "YGO",
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: TournamentStatus.PUBLISHED,
      allowMixedParticipants: true,
      participantType: null,
      location: "Online",
    },
  });

  //
  // ───────────────────────────────────────────────
  //  TOURNAMENT ENTRIES
  // ───────────────────────────────────────────────
  //
  const entryA = await prisma.tournamentEntry.create({
    data: {
      tournamentId: tournament.id,
      participantId: participantPlayerA.id,
      status: TournamentEntryStatus.CONFIRMED,
      seed: 1,
    },
  });

  const entryB = await prisma.tournamentEntry.create({
    data: {
      tournamentId: tournament.id,
      participantId: participantPlayerB.id,
      status: TournamentEntryStatus.CONFIRMED,
      seed: 2,
    },
  });

  const entryTeam = await prisma.tournamentEntry.create({
    data: {
      tournamentId: tournament.id,
      participantId: participantTeamAlpha.id,
      status: TournamentEntryStatus.CONFIRMED,
      seed: 3,
    },
  });

  //
  // ───────────────────────────────────────────────
  //  GROUP (si hay fase de grupos futura)
  // ───────────────────────────────────────────────
  //
  const groupA = await prisma.group.create({
    data: {
      name: "Grupo A",
      tournamentId: tournament.id,
    },
  });

  // Asociar uno al grupo (opcional)
  await prisma.tournamentEntry.update({
    where: { id: entryA.id },
    data: { groupId: groupA.id },
  });

  //
  // ───────────────────────────────────────────────
  //  MATCH
  // ───────────────────────────────────────────────
  //
  await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      roundNumber: 1,
      stage: "Round 1",
      bestOf: 3,
      scheduledAt: new Date().toISOString(),
      participants: [
        { participantId: participantPlayerA.id, score: 0 },
        { participantId: participantPlayerB.id, score: 0 },
      ],
    },
  });

  console.log("🌱 Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
