import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create Players
  const player1 = await prisma.player.upsert({
    where: { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
    update: {},
    create: {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      displayName: 'Alice Smith',
      contactEmail: 'alice@example.com',
      isActive: true,
      preferredDisciplines: ['Chess'],
    },
  });
  console.log(`Created player with id: ${player1.id}`);

  const player2 = await prisma.player.upsert({
    where: { id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0' },
    update: {},
    create: {
      id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
      displayName: 'Bob Johnson',
      contactEmail: 'bob@example.com',
      isActive: true,
      preferredDisciplines: ['Poker'],
    },
  });
  console.log(`Created player with id: ${player2.id}`);

  // Create Teams
  const team1 = await prisma.team.upsert({
    where: { id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01' },
    update: {},
    create: {
      id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
      displayName: 'Team Alpha',
      minMembers: 1,
      maxMembers: 5,
      isActive: true,
    },
  });
  console.log(`Created team with id: ${team1.id}`);

  const team2 = await prisma.team.upsert({
    where: { id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012' },
    update: {},
    create: {
      id: 'd4e5f6a7-b8c9-0123-4567-890abcdef012',
      displayName: 'Team Beta',
      minMembers: 2,
      maxMembers: 10,
      isActive: true,
    },
  });
  console.log(`Created team with id: ${team2.id}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });